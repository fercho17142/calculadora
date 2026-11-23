import Foundation

enum APIError: LocalizedError {
    case server(String)
    case decoding

    var errorDescription: String? {
        switch self {
        case let .server(message):
            return message
        case .decoding:
            return "No se pudo decodificar la respuesta del servidor."
        }
    }
}

struct Envelope<T: Decodable>: Decodable {
    let ok: Bool
    let data: T
}

struct ErrorEnvelope: Decodable {
    let ok: Bool
    let error: String?
}

/// Cliente HTTP para la API REST de BetCalculator Pro.
enum APIClient {
    static var baseURL: URL {
        if let raw = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
           let url = URL(string: raw) {
            return url
        }
        return URL(string: "http://localhost:4001/api")!
    }

    private static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()

    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()

    // MARK: - Endpoints

    static func simulate(config: Config, results: [String]) async throws -> SimulationResponse {
        struct Body: Encodable {
            let config: Config
            let results: [String]
        }
        return try await post("/calculate/simulate", body: Body(config: config, results: results))
    }

    static func scenarios(config: Config) async throws -> ScenariosResponse {
        struct Body: Encodable {
            let config: Config
        }
        return try await post("/scenarios", body: Body(config: config))
    }

    static func probabilities(config: Config, estimatedProbability: Double) async throws -> ProbabilitiesResponse {
        struct Body: Encodable {
            let config: Config
            let estimatedProbability: Double
        }
        return try await post("/probabilities", body: Body(config: config, estimatedProbability: estimatedProbability))
    }

    static func listHistory() async throws -> [HistoryRecord] {
        try await get("/history")
    }

    static func createHistory(_ payload: HistoryPayload) async throws -> HistoryRecord {
        try await post("/history", body: payload)
    }

    static func deleteHistory(id: Int) async throws {
        _ = try await send("/history/\(id)", method: "DELETE")
    }

    // MARK: - Helpers

    private static func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        let data = try await send(path, method: "POST", body: body)
        return try decode(data)
    }

    private static func get<T: Decodable>(_ path: String) async throws -> T {
        let data = try await send(path, method: "GET")
        return try decode(data)
    }

    private static func send(_ path: String, method: String) async throws -> Data {
        var request = URLRequest(url: url(for: path))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response: response, data: data)
        return data
    }

    private static func send<B: Encodable>(_ path: String, method: String, body: B) async throws -> Data {
        var request = URLRequest(url: url(for: path))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try encoder.encode(body)
        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response: response, data: data)
        return data
    }

    private static func url(for path: String) -> URL {
        let component = path.hasPrefix("/") ? String(path.dropFirst()) : path
        return baseURL.appendingPathComponent(component)
    }

    private static func validate(response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else { return }
        guard (200..<300).contains(http.statusCode) else {
            if let envelope = try? decoder.decode(ErrorEnvelope.self, from: data) {
                throw APIError.server(envelope.error ?? "Error HTTP \(http.statusCode)")
            }
            throw APIError.server("Error HTTP \(http.statusCode)")
        }
    }

    private static func decode<T: Decodable>(_ data: Data) throws -> T {
        do {
            let envelope = try decoder.decode(Envelope<T>.self, from: data)
            return envelope.data
        } catch {
            throw APIError.decoding
        }
    }
}
