﻿namespace orbitrush.Dtos;

public class UpdateUserDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public IFormFile? Image { get; set; }
}