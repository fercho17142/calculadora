import Foundation

@MainActor
final class SimulationStore: ObservableObject {
    @Published var config = Config.initial
    @Published var results: [String] = SimulationStore.makeResults(Config.initial)
    @Published var simulation: SimulationResponse?
    @Published var scenarios: ScenariosResponse?
    @Published var isLoading = false
    @Published var errorMessage: String?

    static func makeResults(_ cfg: Config) -> [String] {
        let total = max(0, cfg.totalBets)
        let wins = min(max(cfg.wins, 0), total)
        return (0..<total).map { $0 < wins ? "W" : "L" }
    }

    func update(_ mutate: (inout Config) -> Void) {
        let old = config
        var copy = config
        mutate(&copy)
        config = copy

        if copy.totalBets != old.totalBets || copy.wins != old.wins {
            results = Self.makeResults(copy)
        }
        Task { await refresh() }
    }

    func toggleResult(_ index: Int) {
        guard results.indices.contains(index) else { return }
        results[index] = results[index] == "W" ? "L" : "W"
        Task { await refresh() }
    }

    func resetResults() {
        results = Self.makeResults(config)
        Task { await refresh() }
    }

    func refresh() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            async let simulationTask = APIClient.simulate(config: config, results: results)
            async let scenariosTask = APIClient.scenarios(config: config)
            let (simulationResult, scenariosResult) = try await (simulationTask, scenariosTask)
            simulation = simulationResult
            scenarios = scenariosResult
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
