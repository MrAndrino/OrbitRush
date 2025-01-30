using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using orbitrush.Database.Repositories;
using System.Security.Claims;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FriendRequestController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;

    public FriendRequestController(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("getrequests")]
    public async Task<IActionResult> GetFriendRequests()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var requests = await _unitOfWork.FriendRequestRepository.GetRequestsByTargetIdAsync(userId);
        return Ok(requests);
    }

    [HttpDelete("deleterequests")]
    public async Task<IActionResult> RejectFriendRequest(string senderId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var request = await _unitOfWork.FriendRequestRepository.FindBySenderAndTargetAsync( userId, senderId);
        if (request == null)
            return NotFound(new { message = "No se encontró la solicitud de amistad." });

        await _unitOfWork.FriendRequestRepository.DeleteAsync(request);
        await _unitOfWork.SaveAsync();

        return Ok(new { message = "Solicitud de amistad rechazada correctamente." });
    }
}
