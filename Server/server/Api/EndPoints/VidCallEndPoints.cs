using System;

namespace server.Api.EndPoints;

public static class VidCallEndPoints
{
    public static RouteGroupBuilder MapCallEndPoints(this WebApplication app)
    {
        var group = app.MapGroup("games").WithParameterValidation();

        group.MapGet("/", () => "hello world");

        return group;
    }
}
