using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using orbitrush.Services;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserFriendController : BaseController
{
    private readonly UserFriendService _userFriendService;

    public UserFriendController(UserFriendService userFriendService)
    {
        _userFriendService = userFriendService;
    }

    [HttpDelete("deletefriend")]
    [Authorize]
    public async Task<ActionResult> DeleteFriend([FromBody] int friendId)
    {
        int userId = GetUserId();
        var result = await _userFriendService.DeleteUserFriendAsync(userId, friendId);

        if (!result)
        {
            return NotFound("No se ha encontrado");
        }
        return NoContent();
    }
}