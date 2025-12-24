// src/MahaFight.Infrastructure/Data/AuditEntry.cs
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
using MahaFight.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

public class AuditEntry
{
    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    public EntityEntry Entry { get; }
    public string TableName { get; set; } = string.Empty;
    public Dictionary<string, object> KeyValues { get; } = new Dictionary<string, object>();
    public Dictionary<string, object> OldValues { get; } = new Dictionary<string, object>();
    public Dictionary<string, object> NewValues { get; } = new Dictionary<string, object>();
    public List<PropertyEntry> TemporaryProperties { get; } = new List<PropertyEntry>();

    public bool HasTemporaryProperties => TemporaryProperties.Any();

    public Audit ToAudit()
    {
        var audit = new Audit();
        audit.TableName = TableName;
        audit.Action = Entry.State.ToString();
        audit.KeyValues = JsonConvert.SerializeObject(KeyValues);
        audit.OldValues = OldValues.Count == 0 ? string.Empty : JsonConvert.SerializeObject(OldValues);
        audit.NewValues = NewValues.Count == 0 ? string.Empty : JsonConvert.SerializeObject(NewValues);
        return audit;
    }
}
