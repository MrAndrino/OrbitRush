using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;
using orbitrush.Database.Repositories;
using orbitrush.Dtos;
using orbitrush.Services;
using orbitrush.Utils;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace orbitrush.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private UnitOfWork _unitOfWork;
    private UserService _userService;
    private readonly TokenValidationParameters _tokenParameters;

    public AuthController(IOptionsMonitor<JwtBearerOptions> jwtOptions, UnitOfWork unitOfWork, UserService userService)
    {
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
        _unitOfWork = unitOfWork;
        _userService = userService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AccessTokenJwt>> Login([FromBody] ORLoginRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request?.Password))
            {
                throw new ArgumentException("Password is required.");
            }

            if (string.IsNullOrEmpty(request.NameLabel))
            {
                throw new ArgumentException("Either Email or Name must be provided.");
            }

            User user = await _unitOfWork.UserRepository.CheckData(request.NameLabel, request.Password);

            if (user == null)
            {
                return Unauthorized("Nombre de Usuario, email o contraseña inválidos");
            }

            string accessToken = GenerateToken(user.Id.ToString(), user.Name, user.Image, user.Role);

            return Ok(new AccessTokenJwt { AccessToken = accessToken });
        }

        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AccessTokenJwt>> Register([FromForm] ORRegisterRequest request)
    {
        try
        {
            string defaultImage = "images/OrbitRush-TrashCan.jpg";
            string selectedImage = await _userService.GetUsedImageAsync(request.Image, defaultImage, request.Name);

            bool emailExist = await _unitOfWork.UserRepository.ExistEmail(request.Email);
            bool nameExist = await _unitOfWork.UserRepository.ExistName(request.Name);

            if (emailExist)
            {
                return BadRequest("Este correo ya está en uso.");
            }
            if (nameExist)
            {
                return BadRequest("Este nombre de usuario ya está en uso");
            }

            User newUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                HashPassword = PasswordHelper.Hash(request.Password),
                Image = selectedImage,
                Role = "user",
                State = StateEnum.Connected
            };

            await _unitOfWork.UserRepository.InsertAsync(newUser);
            await _unitOfWork.SaveAsync();

            string accessToken = GenerateToken(newUser.Id.ToString(), newUser.Name, newUser.Image, newUser.Role);

            return Ok(new AccessTokenJwt { AccessToken = accessToken });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    private string GenerateToken(string userId, string userName, string userImage, string userRole)
    {
        SecurityTokenDescriptor securityTokenDescriptor = new SecurityTokenDescriptor
        {
            Claims = new Dictionary<string, object>
            {
                { "id", userId },
                { "name", userName },
                { "image", userImage },
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