using System.Net;
using System.Text;
using System.Text.Json;

using System.Net.WebSockets;
using server.Api.EndPoints;
using server.Api.Dtos;
using server.Api.Utils;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyCorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:5173") // Allowed origins
               .AllowAnyMethod() // Or specify allowed methods (e.g., "GET", "POST")
               .AllowAnyHeader() // Or specify allowed headers
               .AllowCredentials(); // If you need to send cookies or authentication headers
    });
});
builder.Services.AddSingleton<SocketHelper>();
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};
app.UseWebSockets(webSocketOptions);
//HashSet<WebSocket> rooms = new HashSet<WebSocket>();
SocketHelper websoc = new SocketHelper();

//dunno what to do after this 


app.Map("/ws", async (context) =>
{
    //var buffer = new byte[1024 * 4];
    if (context.WebSockets.IsWebSocketRequest)
    {
       // Console.WriteLine("Connected");
        using var ws = await context.WebSockets.AcceptWebSocketAsync();

      //  string userId = context.Request.Query["userId"];
      //  string roomId = context.Request.Query["roomId"];

       /*  if (userId == null) { 
            Console.Write("empty");
            return; } */

        //rooms.Add(ws);
        // SocketHelper Ws = new SocketHelper();
        // await Ws.HandleSocketConnection(ws);\
        //pushing the new user to room 
        await HandleSocketConnection(ws);
    }
    else
    {
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    }
});


async Task HandleSocketConnection(WebSocket ws)
{
   // Console.WriteLine("handle this bitch " + roomId + "," + userId);
   // websoc.AddRoom(roomId, new User(ws, userId));
    if (ws.State == WebSocketState.Open)
    {
       // Console.WriteLine("Connected");
        while (ws.State == WebSocketState.Open)
        {
            await websoc.RecieveInfoAsync(ws);
        }
    }
    await websoc.CloseConnection(ws);
}
app.UseCors("MyCorsPolicy");
app.MapCallEndPoints();
await app.RunAsync();

