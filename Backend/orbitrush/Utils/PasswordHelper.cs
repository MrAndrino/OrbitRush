using System.Security.Cryptography;
using System.Text;

namespace orbitrush.Utils;

public class PasswordHelper
{
    public static string Hash(string password)
    {
        byte[] inputBytes = Encoding.UTF8.GetBytes(password);
        byte[] inputHash = SHA256.HashData(inputBytes);
        return Convert.ToBase64String(inputHash);
    }
}