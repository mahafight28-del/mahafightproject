using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MahaFight.Application.DTOs;

namespace MahaFight.Application.Interfaces
{
    public interface IAuditService
    {
        Task<IEnumerable<AuditDto>> GetAuditsAsync(int pageNumber, int pageSize);
        Task<IEnumerable<AuditDto>> GetAuditsByUserAsync(Guid userId, int pageNumber, int pageSize);
    }
}
