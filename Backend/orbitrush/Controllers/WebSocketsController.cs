using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WebSocketsController : ControllerBase
{
    [Route("/ws")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using WebSocket websocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            await ProcessWebSocket(websocket);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
    private static async Task ProcessWebSocket(WebSocket webSocket)
    {
        byte[] buffer = new byte[1024 * 4];
        WebSocketReceiveResult receiveResult;

        do
        {
            //Recibimos datos
            receiveResult = await webSocket.ReceiveAsync(buffer, CancellationToken.None);

            //Enviamos datos
            await webSocket.SendAsync(
                new ArraySegment<byte>(buffer, 0, receiveResult.Count),
                receiveResult.MessageType,
                receiveResult.EndOfMessage,
                CancellationToken.None);
        }
        while (!receiveResult.CloseStatus.HasValue);

        //Cerramos conexión
        await webSocket.CloseAsync(
            receiveResult.CloseStatus.Value,
            receiveResult.CloseStatusDescription,
            CancellationToken.None);
    }
}