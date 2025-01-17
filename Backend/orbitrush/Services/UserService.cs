using orbitrush.Database.Repositories;

namespace orbitrush.Services;

public class UserService
{
    private UnitOfWork _unitOfWork;

    public UserService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}
