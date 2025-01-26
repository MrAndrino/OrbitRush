using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;

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
            string userId = HttpContext.Request.Query["userId"];

            if (!string.IsNullOrEmpty(userId))
            {
                WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await _websocketService.HandleAsync(webSocket, userId);
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                await HttpContext.Response.WriteAsync("Se necesita un UserId");
            }
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
}