using System.Net.WebSockets;
using System.Text;

namespace orbitrush.Services;

public class WebSocketService
{
    public async Task HandleAsync(WebSocket webSocket)
    {
        while (webSocket.State == WebSocketState.Open)
        {
            string message = await ReadAsync(webSocket);

            if (!string.IsNullOrWhiteSpace(message))
            {
                string outMessage = $"[{string.Join(", ", message as IEnumerable<char>)}]";
                await SendAsync(webSocket, outMessage);
            }
        }
    }

    private async Task<string> ReadAsync(WebSocket webSocket, CancellationToken cancellation = default)
    {
        byte[] buffer = new byte[4096];
        StringBuilder stringBuilder = new StringBuilder();
        bool endOfMessage = false;

        do
        {
            WebSocketReceiveResult result = await webSocket.ReceiveAsync(buffer, cancellation);

            if (result.MessageType == WebSocketMessageType.Text)
            {
                string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                stringBuilder.Append(message);
            }
            else if (result.CloseStatus.HasValue)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, cancellation);
            }
            endOfMessage = result.EndOfMessage;
        }
        while (webSocket.State == WebSocketState.Open && !endOfMessage);

        return stringBuilder.ToString();
    }

    private Task SendAsync(WebSocket webSocket, string message, CancellationToken cancellation = default)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(message);

        return webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, cancellation);
    }
}