using System.Net;
using System.Text;
using System.Text.Json;

using System.Net.WebSockets;
using server.Api.EndPoints;
using server.Api.Dtos;
using server.Api.Utils;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<SocketHelper>();
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};
app.UseWebSockets(webSocketOptions);
HashSet<WebSocket> rooms = new HashSet<WebSocket>();


/* async Task RecieveInfoAsync(WebSocket ws, byte[] buffer)
{
    var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

    Console.WriteLine("result :" + result.MessageType);

    if (result.MessageType == WebSocketMessageType.Text)
    {

        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
        var data = new Message(message);
        // Console.WriteLine($"Recieved : {data.Decode().Type} , Message : {data.Decode().Payload.SDP}");
        Console.WriteLine($"Recieved : {data.Decode().Type} , Message : {data.Decode().Payload.SDP}");

        //  Console.WriteLine($"Recieved : {data.Decode()["type"]} , Message : {data.Decode()["payload"]}");
        // var data = JsonSerializer.Deserialize<Dictionary<string, object>>(message);
        // Console.WriteLine($"Recieved : {data["type"]}");



    }
}



async Task<bool> SendInfoAsync(WebSocket ws, DataStructure data)
{
    //convert the data to json 
    switch (data.Type)
    {
        case "offer":
            var offer = JsonSerializer.Serialize(data);
            var bytes = Encoding.UTF8.GetBytes(offer);
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            await ws.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);
            break;
        case "answer":

        //not how to answere
            var answer = JsonSerializer.Serialize(data);
            var bytesA = Encoding.UTF8.GetBytes(answer);
            var arraySegmentA = new ArraySegment<byte>(bytesA, 0, bytesA.Length);
            await ws.SendAsync(arraySegmentA, WebSocketMessageType.Text, true, CancellationToken.None);
            break;
case "icecandidates" :
    

break ; 

    }

    //ice candidate ka kon lgaega bc


    return false;
} */


//dunno what to do after this 
app.Map("/ws", async (context) =>
{
    var buffer = new byte[1024 * 4];
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("Connected");
        using var ws = await context.WebSockets.AcceptWebSocketAsync();
        rooms.Add(ws);

        /*    Console.WriteLine();
           while (ws.State == WebSocketState.Open)
           {
               //receive 
               await RecieveInfoAsync(ws, buffer);
               //sending 
               //     if (await SendInfoAsync(ws, "hello")) break;

           }
           Console.WriteLine("ws state rn ::" + ws.State);

           Console.WriteLine("Connection closed outside of the loop");
           _ = ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
           rooms.Clear();
           ws.Dispose(); */

        SocketHelper Ws = new SocketHelper();
        await Ws.HandleSocketConnection(ws);
    }
    else
    {
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    }
});
app.MapCallEndPoints();
await app.RunAsync();

