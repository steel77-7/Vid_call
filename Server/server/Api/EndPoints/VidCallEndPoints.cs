using System;
using System.Net.WebSockets;
using System.Net;
namespace server.Api.EndPoints;

public static class VidCallEndPoints
{



    public static RouteGroupBuilder MapCallEndPoints(this WebApplication app)
    {
        var group = app.MapGroup("call").WithParameterValidation();

      /*   app.Map("/ws", async (context) =>
        {
            //var buffer = new byte[1024 * 4];
            if (context.WebSockets.IsWebSocketRequest)
            {
                Console.WriteLine("Connected");
                using var ws = await context.WebSockets.AcceptWebSocketAsync();
                //rooms.Add(ws);
                // SocketHelper Ws = new SocketHelper();
                // await Ws.HandleSocketConnection(ws);

                //pushing the new user to room 

            }
            else
            {
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            }
        }); */

         /*    group.MapPost("/:id",(string id)=> {

            }); */

        

        return group;
    }
}
