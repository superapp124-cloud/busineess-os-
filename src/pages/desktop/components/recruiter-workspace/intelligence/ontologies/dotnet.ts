/**
 * Resume Intelligence OS v3.0 — .NET Ontology
 */
import type { OntologyModule } from './registry';

export const dotnetOntology: OntologyModule = {
  id: 'dotnet', displayName: '.NET Ecosystem', version: '1.0.0',
  entries: [
    { canonical: '.NET', aliases: ['.NET Framework', 'DotNet', 'Dot Net', '.NET Platform', 'Microsoft .NET'], parentCategory: 'Programming Platform', grandparentCategory: 'Software Engineering', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Programming Platform', '.NET'] },
    { canonical: '.NET Core', aliases: ['ASP.NET Core', 'dotnet core', '.NET 5', '.NET 6', '.NET 7', '.NET 8'], parentCategory: '.NET', grandparentCategory: 'Software Engineering', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', '.NET Core'] },
    { canonical: 'ASP.NET', aliases: ['ASP.NET MVC', 'ASP.NET Web Forms', 'WebForms', 'ASP.NET AJAX'], parentCategory: '.NET', grandparentCategory: 'Software Engineering', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'Web', 'ASP.NET'] },
    { canonical: 'C#', aliases: ['CSharp', 'C Sharp', 'C# .NET'], parentCategory: 'Programming Language', grandparentCategory: '.NET', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'Programming Language', 'C#'] },
    { canonical: 'VB.NET', aliases: ['Visual Basic .NET', 'VB .NET'], parentCategory: 'Programming Language', grandparentCategory: '.NET', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'Programming Language', 'VB.NET'] },
    { canonical: 'Entity Framework', aliases: ['EF Core', 'Entity Framework Core', 'EF6'], parentCategory: 'ORM', grandparentCategory: '.NET', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'ORM', 'Entity Framework'] },
    { canonical: 'LINQ', aliases: ['Language Integrated Query', 'LINQ to SQL', 'LINQ to Objects'], parentCategory: '.NET', grandparentCategory: 'Software Engineering', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'Data Access', 'LINQ'] },
    { canonical: 'Web API', aliases: ['.NET Web API', 'ASP.NET Web API', 'RESTful .NET'], parentCategory: '.NET', grandparentCategory: 'Software Engineering', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'API', 'Web API'] },
    { canonical: 'WPF', aliases: ['Windows Presentation Foundation', 'XAML', 'WPF Desktop'], parentCategory: '.NET UI', grandparentCategory: '.NET', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'Desktop', 'WPF'] },
    { canonical: 'SQL Server', aliases: ['MSSQL', 'Microsoft SQL Server', 'T-SQL', 'TSQL'], parentCategory: 'Database', grandparentCategory: 'Microsoft', skillType: 'TechnicalSkill', taxonomy: ['Database', 'Microsoft', 'SQL Server'] },
    { canonical: 'Azure DevOps', aliases: ['VSTS', 'TFS', 'Team Foundation Server', 'ADO'], parentCategory: 'DevOps', grandparentCategory: 'Microsoft', skillType: 'PlatformSkill', taxonomy: ['DevOps', 'Microsoft', 'Azure DevOps'] },
    { canonical: 'NuGet', aliases: ['NuGet Package Manager', '.NET Package Manager'], parentCategory: 'Build Tool', grandparentCategory: '.NET', skillType: 'ToolSkill', taxonomy: ['Software Engineering', '.NET', 'Package Management', 'NuGet'] },
    { canonical: 'SignalR', aliases: ['ASP.NET SignalR', 'Real-time .NET'], parentCategory: '.NET', grandparentCategory: 'Software Engineering', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'Real-time', 'SignalR'] },
    { canonical: 'Blazor', aliases: ['Blazor WebAssembly', 'Blazor Server'], parentCategory: '.NET UI', grandparentCategory: '.NET', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', '.NET', 'Frontend', 'Blazor'] },
  ],
};
