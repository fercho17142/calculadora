import Foundation

// MARK: - Configuración

struct Config: Codable, Equatable {
    var initialCapital: Double
    var odd: Double
    var totalBets: Int
    var goal: Double
    var mode: String
    var riskPercent: Double
    var wins: Int
    var losses: Int

    enum CodingKeys: String, CodingKey {
        case initialCapital, odd, totalBets, goal, mode, riskPercent, wins, losses
    }

    init(
        initialCapital: Double,
        odd: Double,
        totalBets: Int,
        goal: Double,
        mode: String,
        riskPercent: Double,
        wins: Int,
        losses: Int
    ) {
        self.initialCapital = initialCapital
        self.odd = odd
        self.totalBets = totalBets
        self.goal = goal
        self.mode = mode
        self.riskPercent = riskPercent
        self.wins = wins
        self.losses = losses
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        initialCapital = try container.decodeIfPresent(Double.self, forKey: .initialCapital) ?? 0
        odd = try container.decodeIfPresent(Double.self, forKey: .odd) ?? 0
        totalBets = try container.decodeIfPresent(Int.self, forKey: .totalBets) ?? 0
        goal = try container.decodeIfPresent(Double.self, forKey: .goal) ?? 0
        mode = try container.decodeIfPresent(String.self, forKey: .mode) ?? "fixed"
        riskPercent = try container.decodeIfPresent(Double.self, forKey: .riskPercent) ?? 0
        wins = try container.decodeIfPresent(Int.self, forKey: .wins) ?? 0
        losses = try container.decodeIfPresent(Int.self, forKey: .losses) ?? 0
    }

    static let initial = Config(
        initialCapital: 10000,
        odd: 2,
        totalBets: 8,
        goal: 1_000_000,
        mode: "fixed",
        riskPercent: 10,
        wins: 4,
        losses: 4
    )
}

struct BetMode: Identifiable {
    let id: String
    let label: String
}

let betModes: [BetMode] = [
    BetMode(id: "fixed", label: "1 · Apuesta fija"),
    BetMode(id: "total", label: "2 · Reinversión total"),
    BetMode(id: "profit", label: "3 · Reinversión de ganancias"),
    BetMode(id: "percentage", label: "4 · Porcentaje del capital"),
]

// MARK: - Simulación

struct Bet: Codable, Identifiable {
    let number: Int
    let capitalBefore: Double
    let stake: Double
    let odd: Double
    let result: String
    let grossReturn: Double
    let net: Double
    let capitalAfter: Double

    var id: Int { number }
}

struct Summary: Codable {
    let initialCapital: Double
    let finalCapital: Double
    let netGain: Double
    let profitability: Double
    let totalStaked: Double
    let totalReturned: Double
    let wins: Int
    let losses: Int
    let goal: Double
    let goalAchieved: Bool
    let goalDifference: Double
    let completionPercent: Double
}

struct SimulationResponse: Codable {
    let config: Config
    let bets: [Bet]
    let summary: Summary
}

// MARK: - Escenarios

struct Scenario: Codable, Identifiable {
    let wins: Int
    let losses: Int
    let label: String
    let best: Summary
    let worst: Summary

    var id: String { label }
}

struct ScenariosResponse: Codable {
    let config: Config
    let scenarios: [Scenario]
}

// MARK: - Probabilidades

struct ProbabilitiesResponse: Codable {
    let config: Config
    let impliedProbability: Double
    let estimatedProbability: Double
    let lossProbability: Double
    let minWinsRequired: Int?
    let probabilityToReachGoal: Double
    let disclaimer: String
}

// MARK: - Historial

struct HistoryRecord: Codable, Identifiable {
    let id: Int
    let initialCapital: Double
    let odd: Double
    let totalBets: Int
    let goal: Double
    let mode: String
    let riskPercent: Double
    let wins: Int
    let losses: Int
    let finalCapital: Double
    let netGain: Double
    let profitability: Double
    let totalStaked: Double
    let totalReturned: Double
    let goalAchieved: Bool
    let resultsJson: String?
    let createdAt: String
    let updatedAt: String
}

struct HistoryPayload: Encodable {
    let initialCapital: Double
    let odd: Double
    let totalBets: Int
    let goal: Double
    let mode: String
    let riskPercent: Double
    let wins: Int
    let losses: Int
    let finalCapital: Double
    let netGain: Double
    let profitability: Double
    let totalStaked: Double
    let totalReturned: Double
    let goalAchieved: Bool
}
