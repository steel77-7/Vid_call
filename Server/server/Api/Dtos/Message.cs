using System.Text.Json;
namespace server.Api.Dtos;

public class Message
{
    private string encodedData;

    public Message(string data)
    {
        encodedData = data;
    }
    public DataStructure Decode()
    {
         var options = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        AllowTrailingCommas = true
    };
        try
        {
           // Console.WriteLine(encodedData);
          
            var decodedData = JsonSerializer.Deserialize<DataStructure>(encodedData,options);
            if (decodedData == null)
            {
                throw new Exception("Json data was not serialized in Message.cs");
            }
            return decodedData;
        }
        catch (Exception ex)
        {
            Console.WriteLine("Exception occured : " + ex);
            return new DataStructure();
        }
       
    }

}


public class DataStructure{ 

    public string Type{get; set;}
    public PayloadData Payload {get;set;}
}



public class PayloadData{ 

    public string? SDP {get;set;}

    public string? IceCandidate {get;set;}
    public string? RoomId {get;set;}

    public string? UserId {get;set;}



}

/* public class Sdp { 
    public string? sdp{get;set;}
    public string? type{get;set;}

} */


