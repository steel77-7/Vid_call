using System.Net;
using System.Text;
using System.Net.WebSockets;
using server.Api.EndPoints;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.UseWebSockets();
var rooms = new List<WebSocket>();




async Task RecieveInfoAsync(WebSocket ws, byte[] buffer)
{
    Console.Write("1");
    var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    if (result.MessageType == WebSocketMessageType.Text)
    {
        Console.Write("2");

        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
        Console.WriteLine($"Recieved : {message}");
    }
}
//dunno what to do after this 
app.Map("/ws", async (context) =>
{

    var buffer = new byte[1024 * 4];
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("Connected");

        using var ws = await context.WebSockets.AcceptWebSocketAsync();
        rooms.Add(ws);
        while (ws.State == WebSocketState.Open)
        {

            ///
            Console.WriteLine("ws state rn ::"+ws.State);
            string message = "hello world";
            var bytes = Encoding.UTF8.GetBytes(message);
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);

            //for a recieved message
            await RecieveInfoAsync(ws, buffer);
            if (ws.State == WebSocketState.Open)
                await ws.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);

            ////
            ///


            else if (ws.State == WebSocketState.Closed || ws.State == WebSocketState.Aborted
             )
            {
                await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                break;
            }
            Thread.Sleep(1000);
        }

        Console.WriteLine("Connection closed");
    }
    else
    {
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    }
});





app.MapCallEndPoints();
await app.RunAsync();

