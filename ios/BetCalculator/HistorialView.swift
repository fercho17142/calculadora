import SwiftUI

struct HistorialView: View {
    @EnvironmentObject var store: SimulationStore
    @State private var records: [HistoryRecord] = []
    @State private var errorMessage: String?
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            List {
                if let error = errorMessage {
                    Text(error)
                        .font(.footnote)
                        .foregroundColor(.appDanger)
                }

                if records.isEmpty && !isLoading {
                    Text("No hay registros. Guarda tu simulación actual.")
                        .foregroundColor(.secondary)
                }

                ForEach(records) { record in
                    HistoryRow(record: record)
                }
                .onDelete(perform: delete)
            }
            .scrollContentBackground(.hidden)
            .background(Color.appSurface)
            .navigationTitle("Historial")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Guardar actual") {
                        saveCurrent()
                    }
                }
            }
        }
        .task { await load() }
        .refreshable { await load() }
    }

    private func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            records = try await APIClient.listHistory()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            let id = records[index].id
            Task {
                try? await APIClient.deleteHistory(id: id)
                await load()
            }
        }
    }

    private func saveCurrent() {
        guard let summary = store.simulation?.summary else { return }
        let payload = HistoryPayload(
            initialCapital: summary.initialCapital,
            odd: store.config.odd,
            totalBets: store.config.totalBets,
            goal: summary.goal,
            mode: store.config.mode,
            riskPercent: store.config.riskPercent,
            wins: summary.wins,
            losses: summary.losses,
            finalCapital: summary.finalCapital,
            netGain: summary.netGain,
            profitability: summary.profitability,
            totalStaked: summary.totalStaked,
            totalReturned: summary.totalReturned,
            goalAchieved: summary.goalAchieved
        )

        Task {
            do {
                _ = try await APIClient.createHistory(payload)
                await load()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

private struct HistoryRow: View {
    let record: HistoryRecord

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(formatDate(record.createdAt))
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text(record.goalAchieved ? "Meta alcanzada" : "Meta no alcanzada")
                    .font(.caption2).fontWeight(.semibold)
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background((record.goalAchieved ? Color.appSuccess : Color.appDanger).opacity(0.15))
                    .foregroundColor(record.goalAchieved ? .appSuccess : .appDanger)
                    .clipShape(Capsule())
            }

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Capital final: \(formatCOP(record.finalCapital))").bold()
                    Text("Inicial: \(formatCOP(record.initialCapital)) · Cuota \(formatNumber(record.odd))")
                        .font(.caption).foregroundColor(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(record.netGain >= 0 ? "+\(formatCOP(record.netGain))" : formatCOP(record.netGain))
                        .bold()
                        .foregroundColor(record.netGain >= 0 ? .appSuccess : .appDanger)
                    Text("\(record.wins)V / \(record.losses)D · \(formatPercent(record.profitability))")
                        .font(.caption).foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
        .listRowBackground(Color.appCard.opacity(0.5))
    }

    private func formatDate(_ iso: String) -> String {
        String(iso.prefix(16)).replacingOccurrences(of: "T", with: " ")
    }
}
