using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using orbitrush.Database.Repositories;
using orbitrush.Dtos;
using orbitrush.Services;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
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
    public async Task<ActionResult<string>> GetNameById([FromQuery] int id)
    {
        try
        {
            return await _userService.GetNameById(id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("friendlist")]
    [Authorize]
    public async Task<ActionResult<List<UserFriendDto>>> GetFriendList([FromQuery] int id)
    {
        try
        {
            return await _userService.GetFriendList(id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}