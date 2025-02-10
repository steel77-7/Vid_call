using System;
using System.Net.WebSockets;
namespace server.Api.EndPoints;

public static class VidCallEndPoints
{



    public static RouteGroupBuilder MapCallEndPoints(this WebApplication app)
    {
        var group = app.MapGroup("call").WithParameterValidation();

     /*    group.MapPost("/make-room/:id", (string id) =>{ 
            room.Add
        }); */

        return group;
    }
}
