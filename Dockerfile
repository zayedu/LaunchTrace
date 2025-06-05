FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["LaunchTrace/LaunchTrace.csproj", "LaunchTrace/"]
RUN dotnet restore "LaunchTrace/LaunchTrace.csproj"
COPY . .
WORKDIR "/src/LaunchTrace"
RUN dotnet build "LaunchTrace.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "LaunchTrace.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LaunchTrace.dll"]
