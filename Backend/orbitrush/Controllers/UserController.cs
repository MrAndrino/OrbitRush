using Microsoft.AspNetCore.Authorization;
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
    public async Task<ActionResult<List<UserFriendDto>>> GetFriendList()
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
    public async Task<ActionResult<List<UserFriendDto>>> GetUsersExcludingFriends()
    {
        try
        {
            int userId = GetUserId();
            var users = await _userService.GetUsersExcludingFriends(userId);

            if (users == null || !users.Any())
            {
                return NotFound("No users found");
            }

            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
        }
    }

}