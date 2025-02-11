using System;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text;
using server.Api.Dtos;
namespace server.Api.Utils;

public class SocketHelper
{
    //for the rooms.....but nothing for the users 


    private Dictionary<string, Dictionary<string, User>> room = new();
    private byte[] buffer = new byte[1024 * 4];
    private async Task Send(WebSocket ws, DataStructure data)
    {
        var toSend = JsonSerializer.Serialize(data);
        var bytes = Encoding.UTF8.GetBytes(toSend);
        var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
        await ws.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);
    }
    public void AddRoom(string roomId, User user)
    {

        if (room.ContainsKey(roomId))
        {
            var prevDict = room[roomId];
            prevDict[user.Id] = user;
        }
        else
        {
            //   room[roomId] = new List<User>([user]);
            room[roomId] = new Dictionary<string, User>
            {
                [user.Id] = user
            };

        }
    }

    public async Task SendInfoAsync(DataStructure data, WebSocket ws)
    {
        Console.WriteLine($"data {data.Type}");
        if (ws.State == WebSocketState.Open)
        {

            switch (data.Type)
            {
                case "connect":
                    Console.WriteLine("Connect");

                    // AddRoom(data.Payload.RoomId, new User(ws,data.Payload.UserId ));
                    break;
                case "join-room":
                    Console.WriteLine("join-room");
                    //add the first person to the room 
                    AddRoom(data.Payload.RoomId, new User(ws, data.Payload.UserId));
                    data.Type = "offer";
                    Console.WriteLine("offer");
                    //iterating thriugh the specified room 
                    foreach (var i in room[data.Payload.RoomId])
                    {
                        if (!(i.Key == data.Payload.UserId))
                        {
                            Console.WriteLine($"Sending message to {i.Key}");
                            await Send(ws, data);
                        }
                    }
                    break;

                case "answer":
                    Console.WriteLine("answer");

                    await Send(ws, data);
                    break;

                case "icecandidate":
                    Console.WriteLine("icecandidate");

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
                Console.WriteLine("messgae :" + message);
                var rawData = new Message(message);
                DataStructure info = rawData.Decode();
                //   Console.WriteLine($"Recieved : {info.Type} , Message : {info.Payload.SDP}");
                Console.WriteLine("ture data :" + info.Type);

                if (info.GetType != null)
                {
                    await SendInfoAsync(info, ws);
                }
            }
        }
    }
    /*   public async Task HandleSocketConnection(WebSocket ws)
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
      } */

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



public class User
{

    WebSocket Ws { get; set; }
    public string Id { get; set; }
    public User(WebSocket ws, string Id)
    {
        this.Ws = ws;
        this.Id = Id;
    }

}