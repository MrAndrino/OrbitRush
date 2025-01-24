using Microsoft.AspNetCore.Mvc;
using orbitrush.Services;
using System.Net.WebSockets;

namespace orbitrush.Controllers;

[Route("socket")]
[ApiController]
public class WebSocketController : ControllerBase
{
    private readonly WebSocketService _websocketService;

    public WebSocketController(WebSocketService websocketService)
    {
        _websocketService = websocketService;
    }

    [HttpGet]
    public async Task ConnectAsync()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            await _websocketService.HandleAsync(webSocket);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
}