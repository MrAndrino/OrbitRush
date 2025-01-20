using orbitrush.Database.Repositories;

namespace orbitrush.Services;

public class UserService
{
    private UnitOfWork _unitOfWork;

    public UserService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<string> GetUsedImageAsync(IFormFile image, string defaultImage, string name)
    {
        if (image == null)
        {
            return defaultImage;
        }

        string fileName = name.ToLower() + "_" + Guid.NewGuid().ToString();
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "profiles", fileName);


        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        return "images/profiles/" + fileName;
    }
}