using System;

namespace MahaFight.Application.DTOs
{
    public class AuditDto
    {
        public int Id { get; set; }
        public string TableName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string KeyValues { get; set; } = string.Empty;
        public string OldValues { get; set; } = string.Empty;
        public string NewValues { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
