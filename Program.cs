using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PropertyAppApi.Models;
using System;
using Microsoft.Extensions.Logging;

namespace PropertyAppApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.ConfigureServices((context, services) =>
                    {
                        var connectionString = context.Configuration.GetConnectionString("DefaultConnection");

                        services.AddDbContext<ApplicationDbContext>(options =>
                        {
                            options.UseSqlite(connectionString)
                                   .LogTo(Console.WriteLine, LogLevel.Information)
                                   .EnableSensitiveDataLogging(context.HostingEnvironment.IsDevelopment())
                                   .EnableDetailedErrors(context.HostingEnvironment.IsDevelopment());
                        });

                        services.AddControllers();

                        // Swagger Setup
                        services.AddSwaggerGen(c =>
                        {
                            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Property API", Version = "v1" });
                        });

                        // CORS Setup
                        services.AddCors(options =>
                        {
                            options.AddPolicy("AllowAll", policy =>
                                policy.AllowAnyOrigin()
                                       .AllowAnyMethod()
                                       .AllowAnyHeader());
                        });
                    });

                    webBuilder.Configure(app =>
                    {
                        if (app.ApplicationServices.GetService<IWebHostEnvironment>().IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        app.UseHttpsRedirection();
                        app.UseCors("AllowAll");
                        app.UseRouting();
                        app.UseAuthorization();
                        app.UseEndpoints(endpoints =>
                        {
                            endpoints.MapControllers();
                        });
                    });
                });
    }
}
