// src/MahaFight.Domain/Entities/Audit.cs
using System;

namespace MahaFight.Domain.Entities
{
    public class Audit : BaseEntity
    {
        public string TableName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string KeyValues { get; set; } = string.Empty;
        public string OldValues { get; set; } = string.Empty;
        public string NewValues { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
    }
}
