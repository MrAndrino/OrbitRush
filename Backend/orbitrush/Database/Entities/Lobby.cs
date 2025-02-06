namespace orbitrush.Database.Entities;

public class Lobby
{
    public string Id { get; set; }
    public string Player1Id { get; set; }
    public string Player2Id { get; set; }
    public bool Player1Ready { get; set; }
    public bool Player2Ready { get; set; }


    public Lobby (string id, string player1Id, string player2Id) 
    {
        Id = id;
        Player1Id = player1Id;
        Player2Id = player2Id;
        Player1Ready = false;
        Player2Ready = false;
    }

    public bool BothPlayerReady()=> Player1Ready && Player2Ready;

}
