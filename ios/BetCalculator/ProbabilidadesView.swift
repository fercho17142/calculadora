import SwiftUI

struct ProbabilidadesView: View {
    @EnvironmentObject var store: SimulationStore
    @State private var estimated: Double = 50
    @State private var data: ProbabilitiesResponse?
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    CardView(title: "Tu probabilidad estimada de ganar") {
                        VStack(spacing: 12) {
                            Slider(value: $estimated, in: 0...100, step: 1)
                                .tint(Color.appBrand)
                            Text("\(formatNumber(estimated, decimals: 0))%")
                                .font(.title3).bold()
                                .foregroundColor(.appBrand)
                                .frame(maxWidth: .infinity, alignment: .trailing)
                        }
                    }

                    if let error = errorMessage {
                        Text(error)
                            .font(.footnote)
                            .foregroundColor(.appDanger)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    if let data = data {
                        resultsGrid(data)
                    }

                    disclaimer
                }
                .padding()
            }
            .background(Color.appSurface.ignoresSafeArea())
            .navigationTitle("Probabilidades")
        }
        .task(id: estimated) {
            await load()
        }
        .onChange(of: store.config) { _ in
            Task { await load() }
        }
    }

    private func resultsGrid(_ data: ProbabilitiesResponse) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
            StatCard(title: "Probabilidad implícita", value: formatPercent(data.impliedProbability), color: .appBrand, icon: "percent")
            StatCard(title: "Probabilidad estimada", value: formatPercent(data.estimatedProbability), color: .appBrand, icon: "person.fill.checkmark")
            StatCard(title: "Probabilidad de perder", value: formatPercent(data.lossProbability), color: .appDanger, icon: "person.fill.xmark")
            StatCard(title: "Victorias mínimas", value: data.minWinsRequired.map(String.init) ?? "Inalcanzable", color: .appWarning, icon: "trophy")
            StatCard(title: "Probabilidad de alcanzar la meta", value: formatPercent(data.probabilityToReachGoal), color: data.probabilityToReachGoal >= 50 ? .appSuccess : .appWarning, icon: "flag.checkered")
        }
    }

    private var disclaimer: some View {
        CardView(title: "Aclaración importante") {
            Text(data?.disclaimer ?? "La probabilidad implícita no representa necesariamente la probabilidad real y las simulaciones no predicen resultados.")
                .font(.footnote)
                .foregroundColor(.appWarning)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func load() async {
        do {
            data = try await APIClient.probabilities(config: store.config, estimatedProbability: estimated)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
