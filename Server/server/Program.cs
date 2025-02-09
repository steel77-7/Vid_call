using System.Net;
using System.Text;
using System.Net.WebSockets;
using server.Api.EndPoints;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");



var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};
app.UseWebSockets(webSocketOptions);
HashSet<WebSocket> rooms = new HashSet<WebSocket>();




async Task RecieveInfoAsync(WebSocket ws, byte[] buffer)
{
    Console.WriteLine("1");
    var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    Console.WriteLine("result :" + result.MessageType);

    if (result.MessageType == WebSocketMessageType.Text)
    {
        Console.Write("2");

        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
        Console.WriteLine($"Recieved : {message}");
    }
}

/* app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            using var ws = await context.WebSockets.AcceptWebSocketAsync();
            Console.WriteLine(ws+"connected");
            rooms.Add(ws);
            foreach (var i in rooms)
            {
                Console.Write(i + ",,,,");
            }
            var buffer = new byte[1024 * 4];
            while (ws.State == WebSocketState.Open)
            {
                await RecieveInfoAsync(ws, buffer);
            }
        }
    }
    else
    {
        await next();
    }
}); */

//dunno what to do after this 
app.Map("/ws", async (context) =>
{

    var buffer = new byte[1024 * 4];
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("Connected");

        using var ws = await context.WebSockets.AcceptWebSocketAsync();
        rooms.Add(ws);
        foreach (var i in rooms)
        {
            Console.Write(i + ",,,,");
        }
        Console.WriteLine();
        while (ws.State == WebSocketState.Open)
        {

            //receive 
            await RecieveInfoAsync(ws, buffer);


            //sending 
            string message = "hello world";
            var bytes = Encoding.UTF8.GetBytes(message);
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            if (ws.State == WebSocketState.Open)
                await ws.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);

            //if the connection closed in between
            else if (ws.State == WebSocketState.Closed || ws.State == WebSocketState.Aborted
                     )
            {
                Console.WriteLine("ws state rn ::" + ws.State);

                Console.WriteLine("Connection closed");
                await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                break;
            }


            ////
            ///



        }
        Console.WriteLine("ws state rn ::" + ws.State);

        Console.WriteLine("Connection closed outside of the loop");
        _ = ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
        rooms.Clear();
        ws.Dispose();
    }
    else
    {
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    }
});





app.MapCallEndPoints();
await app.RunAsync();

