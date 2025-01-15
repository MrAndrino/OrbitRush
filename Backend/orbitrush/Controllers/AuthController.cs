using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using orbitrush.Database.Entities;
using orbitrush.Database.Repositories;
using orbitrush.Dtos;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private UnitOfWork _unitOfWork;
    private readonly TokenValidationParameters _tokenParameters;

    public AuthController(IOptionsMonitor<JwtBearerOptions> jwtOptions, UnitOfWork unitOfWork)
    {
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
        _unitOfWork = unitOfWork;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AccessTokenJwt>> Login([FromBody] LoginRequest2 request)
    {
        try
        {
            if (string.IsNullOrEmpty(request?.Password))
            {
                throw new ArgumentException("Password is required.");
            }

            if (string.IsNullOrEmpty(request?.Email) && string.IsNullOrEmpty(request?.Name))
            {
                throw new ArgumentException("Either Email or Name must be provided.");
            }

            User user = await _unitOfWork.UserRepository.CheckData(request.Email, request.Name, request.Password);

            if (user == null)
            {
                return Unauthorized("Nombre de Usuario, email o contraseña inválidos");
            }

            string accessToken = GenerateToken(user.Id.ToString(), user.Name, user.Email, user.Role);

            return Ok(new AccessTokenJwt { AccessToken = accessToken });
        }

        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    private string GenerateToken(string userId, string userName, string userRole, string userEmail)
    {
        SecurityTokenDescriptor securityTokenDescriptor = new SecurityTokenDescriptor
        {
            Claims = new Dictionary<string, object>
            {
                { "id", userId },
                { "name", userName },
                { "email", userEmail },
                {ClaimTypes.Role, userRole }
            },

            //Cambiar tiempo a 10 minutos al acabar proyecto
            Expires = DateTime.UtcNow.AddDays(1),
            SigningCredentials = new SigningCredentials(_tokenParameters.IssuerSigningKey, SecurityAlgorithms.HmacSha256Signature)
        };

        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        SecurityToken token = tokenHandler.CreateToken(securityTokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}