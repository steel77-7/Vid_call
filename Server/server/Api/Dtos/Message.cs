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
        try
        {

            Console.WriteLine(encodedData);
            var decodedData = JsonSerializer.Deserialize<DataStructure>(encodedData);
            if (decodedData == null)
            {
                throw new Exception("Json data was serialized in Message.cs");
            }
            return decodedData;
        }
        catch (Exception ex)
        {


            Console.WriteLine("Exception occured : " + ex);
            return new DataStructure();
        }
        finally { 

            Console.WriteLine("JSon serialization here ");
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


}