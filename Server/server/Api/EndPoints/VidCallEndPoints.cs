using System;
using System.Net.WebSockets;
namespace server.Api.EndPoints;

public static class VidCallEndPoints
{



    public Dictionary<string ,WebSocket>  room;
    public static RouteGroupBuilder MapCallEndPoints(this WebApplication app)
    {
        var group = app.MapGroup("call").WithParameterValidation();

        group.MapGet("/make-room/:id", (string id) =>{ 

        });

        return group;
    }
}
