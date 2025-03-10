﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using orbitrush.Database.Repositories;
using orbitrush.Dtos;
using orbitrush.Services;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : BaseController
{
    private UnitOfWork _unitOfWork;
    private UserService _userService;

    public UserController(UnitOfWork unitOfWork, UserService userService)
    {
        _unitOfWork = unitOfWork;
        _userService = userService;
    }

    [HttpGet("getnameid")]
    [Authorize]
    public async Task<ActionResult<string>> GetNameById()
    {
        try
        {
            int id = GetUserId();
            return await _userService.GetNameById(id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("friendlist")]
    [Authorize]
    public async Task<ActionResult<List<UserDto>>> GetFriendList()
    {
        try
        {
            int id = GetUserId();
            return await _userService.GetFriendList(id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("userlist")]
    [Authorize]
    public async Task<ActionResult<List<UserDto>>> GetUsersExcludingFriends()
    {
        try
        {
            int userId = GetUserId();
            var users = await _userService.GetUsersExcludingFriends(userId);

            if (users == null || !users.Any())
            {
                return NotFound("No hay usuarios.");
            }

            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
        }
    }

    [HttpGet("search")]
    [Authorize]
    public async Task<IActionResult> Search([FromQuery] string search, [FromQuery] bool includeFriends)
    {
        int id = GetUserId();
        var result = await _userService.SearchUsers(id, search, includeFriends);
        return Ok(result);
    }

    [HttpGet("selfprofile")]
    [Authorize]
    public async Task<IActionResult> GetUserMatches()
    {
        try
        {
            int userId = GetUserId();
            var userWithMatches = await _userService.GetUserWithMatches(userId);

            if (userWithMatches == null)
            {
                return NotFound("Usuario no encontrado o sin partidos.");
            }

            return Ok(userWithMatches);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
        }
    }

    [HttpGet("userprofile")]
    [Authorize]
    public async Task<IActionResult> GetUserProfile(int id)
    {
        try
        {
            var userProfile = await _userService.GetUserProfile(id);
            if (userProfile == null)
            {
                return NotFound("Usuario no encontrado.");
            }
            return Ok(userProfile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPut("updateprofile")]
    [Authorize]
    public async Task<IActionResult> UpdateUserprofile([FromForm] UpdateUserDto userDto)
    {
        try
        {
            int userId = GetUserId();

            await _userService.UpdateUserProfileInDatabase(userId, userDto);

            return NoContent();

        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al actualizar el usuario.", detail = ex.Message });
        }
    }

    [HttpGet("allusers")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            int userId = GetUserId();
            var users = await _userService.GetAllUsersAsync(userId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPatch("updaterole/{userId}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateUserRole(int userId, [FromBody] string newRole)
    {
        bool updated = await _userService.UpdateUserRole(userId, newRole);
        if (!updated)
            return NotFound(new { message = "Usuario no encontrado." });

        return Ok(new { message = "Rol actualizado correctamente." });
    }

    [HttpPatch("toggleban/{userId}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ToggleBanUser(int userId)
    {
        bool updated = await _userService.ToggleBanUser(userId);
        if (!updated)
            return NotFound(new { message = "Usuario no encontrado." });

        return Ok(new { message = "Estado de baneo cambiado correctamente." });
    }
}