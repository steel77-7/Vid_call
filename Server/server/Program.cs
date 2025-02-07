using System.Net;
using System.Text;
using System.Net.WebSockets;
using server.Api.EndPoints;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

//app.MapGet("/", () => "Hello World!");

app.UseWebSockets();
var rooms = new List<WebSocket>();

//dunno what to do after this 
app.Map("/ws", async (context) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("Connected");
          
        while (true)
        {
            using var ws = await context.WebSockets.AcceptWebSocketAsync();
            string message = "hello world";
            var bytes = Encoding.UTF8.GetBytes(message);
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            if (ws.State == WebSocketState.Open)
                await ws.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);
            else if (ws.State == WebSocketState.Closed || ws.State == WebSocketState.Aborted
             )
            {
                break;
            }
            Thread.Sleep(1000);
        }
    }
    else
    {
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    }
});
app.MapCallEndPoints();
await app.RunAsync();

