using System;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text;
using server.Api.Dtos;
namespace server.Api.Utils;

public class SocketHelper
{

    private Dictionary<string, WebSocket> room = new();
    private byte[] buffer = new byte[1024 * 4];
    private async Task Send(WebSocket ws, DataStructure data)
    {
        var toSend = JsonSerializer.Serialize(data);
        var bytes = Encoding.UTF8.GetBytes(toSend);
        var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
        await ws.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);
    }
    public void AddSocket(string roomId, WebSocket ws)
    {
        room[roomId] = ws;
    }

    public async Task SendInfoAsync(DataStructure data, WebSocket ws)
    {
        if (ws.State == WebSocketState.Open)
        {

            switch (data.Type)
            {
                case "connect":
                    //AddSocket(data.Payload.RoomId, ws);
                    break;
                case "offer":
                    await Send(ws, data);
                    break;

                case "answer":
                    await Send(ws, data);
                    break;

                case "icecandidate":
                    await Send(ws, data);
                    break;
            }
            //var toSend = JsonSerializer.Serialize(data);

        }
    }

    public async Task RecieveInfoAsync(WebSocket ws)
    {
        if (ws.State == WebSocketState.Open)
        {
            var res = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (res.MessageType == WebSocketMessageType.Text)
            {
                var message = Encoding.UTF8.GetString(buffer, 0, res.Count);
                var rawData = new Message(message);
                DataStructure info = rawData.Decode();
                Console.WriteLine($"Recieved : {info.Type} , Message : {info.Payload.SDP}");
                if (info.GetType != null)
                {
                    await SendInfoAsync(info, ws);
                }
            }
        }
    }
    public async Task HandleSocketConnection(WebSocket ws)
    {
        if (ws.State == WebSocketState.Open)
        {
            Console.WriteLine("Connected");
            while (ws.State == WebSocketState.Open)
            {
                await RecieveInfoAsync(ws);
            }
        }
        await CloseConnection(ws);
    }

    //will make it afterwards
    /*  public async Task RemovePeer( ){ 

     } */

    public async Task CloseConnection(WebSocket ws)
    {

        Console.WriteLine("Connection closed");
        await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
        ws.Dispose();
    }
}
