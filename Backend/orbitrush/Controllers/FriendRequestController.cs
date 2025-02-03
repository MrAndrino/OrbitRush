using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using orbitrush.Database.Repositories;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FriendRequestController : BaseController
{
    private readonly UnitOfWork _unitOfWork;

    public FriendRequestController(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("getrequests")]
    public async Task<IActionResult> GetFriendRequests()
    {
        var userId = GetUserId();
        var requests = await _unitOfWork.FriendRequestRepository.GetRequestsByTargetIdAsync(userId.ToString());
        var requestData = new List<object>();

        foreach (var request in requests)
        {
            var senderName = await _unitOfWork.UserRepository.GetNameByIdAsync(int.Parse(request.SenderId));
            requestData.Add(new { request.Id, request.SenderId, request.TargetId, SenderName = senderName });
        }
        return Ok(requestData);
    }

    [HttpDelete("deleterequests")]
    public async Task<IActionResult> RejectFriendRequest(string senderId)
    {
        var userId = GetUserId();
        var request = await _unitOfWork.FriendRequestRepository.FindBySenderAndTargetAsync(senderId, userId.ToString());
        if (request == null)
        {
            return NotFound(new { message = "No se encontró la solicitud de amistad." });
        }

        await _unitOfWork.FriendRequestRepository.DeleteAsync(request);
        await _unitOfWork.SaveAsync();

        return Ok(new { message = "Solicitud de amistad rechazada correctamente." });
    }
}