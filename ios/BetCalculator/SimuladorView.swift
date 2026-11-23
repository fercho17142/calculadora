import SwiftUI

struct SimuladorView: View {
    @EnvironmentObject var store: SimulationStore
    @State private var savedMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    ConfigFormView()

                    HStack(spacing: 12) {
                        Button {
                            saveToHistory()
                        } label: {
                            Label("Guardar en historial", systemImage: "square.and.arrow.down")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.appBrand)

                        Button {
                            store.resetResults()
                        } label: {
                            Label("Restablecer", systemImage: "arrow.counterclockwise")
                        }
                        .buttonStyle(.bordered)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    if let message = savedMessage {
                        Text(message)
                            .font(.footnote)
                            .foregroundColor(.appSuccess)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    if let sim = store.simulation {
                        summaryCards(sim)
                        resultsTable(sim)
                    }
                }
                .padding()
            }
            .background(Color.appSurface.ignoresSafeArea())
            .navigationTitle("Simulador")
        }
    }

    private func summaryCards(_ sim: SimulationResponse) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
            StatCard(title: "Capital final", value: formatCOP(sim.summary.finalCapital), color: .appBrand, icon: "briefcase")
            StatCard(title: "Ganancia neta", value: formatCOP(sim.summary.netGain), color: sim.summary.netGain >= 0 ? .appSuccess : .appDanger, icon: sim.summary.netGain >= 0 ? "arrow.up.right" : "arrow.down.right")
            StatCard(title: "Rentabilidad", value: formatPercent(sim.summary.profitability), color: sim.summary.profitability >= 0 ? .appSuccess : .appDanger, icon: "percent")
            StatCard(title: "Total apostado", value: formatCOP(sim.summary.totalStaked), color: .appBrand, icon: "banknote")
        }
    }

    private func resultsTable(_ sim: SimulationResponse) -> some View {
        CardView(title: "Detalle de la simulación") {
            VStack(spacing: 0) {
                HStack {
                    Text("#").frame(width: 28, alignment: .leading)
                    Text("Valor apostado").frame(maxWidth: .infinity, alignment: .leading)
                    Text("Resultado").frame(maxWidth: .infinity, alignment: .center)
                    Text("Neto / Capital después").frame(maxWidth: .infinity, alignment: .trailing)
                }
                .font(.caption2)
                .foregroundColor(.secondary)
                .padding(.bottom, 6)

                ForEach(Array(sim.bets.enumerated()), id: \.offset) { index, bet in
                    Divider()
                    Button {
                        store.toggleResult(index)
                    } label: {
                        HStack(spacing: 8) {
                            Text("\(bet.number)")
                                .foregroundColor(.secondary)
                                .frame(width: 28, alignment: .leading)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(formatCOP(bet.stake)).font(.subheadline).bold()
                                Text("antes \(formatCOP(bet.capitalBefore))")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)

                            ResultBadge(result: bet.result)
                                .frame(maxWidth: .infinity, alignment: .center)

                            VStack(alignment: .trailing, spacing: 2) {
                                Text(bet.net >= 0 ? "+\(formatCOP(bet.net))" : formatCOP(bet.net))
                                    .font(.subheadline).bold()
                                    .foregroundColor(bet.net >= 0 ? .appSuccess : .appDanger)
                                Text("después \(formatCOP(bet.capitalAfter))")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .trailing)
                        }
                        .padding(.vertical, 10)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func saveToHistory() {
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
                savedMessage = "Simulación guardada en el historial."
            } catch {
                savedMessage = error.localizedDescription
            }
        }
    }
}

struct ConfigFormView: View {
    @EnvironmentObject var store: SimulationStore
    @State private var draft = Config.initial

    var body: some View {
        CardView(title: "Configuración") {
            VStack(spacing: 14) {
                TextField("Capital inicial (COP)", value: $draft.initialCapital, format: .number)
                    .keyboardType(.numberPad)
                    .fieldStyle()

                TextField("Cuota decimal", value: $draft.odd, format: .number)
                    .keyboardType(.decimalPad)
                    .fieldStyle()

                Stepper(value: $draft.totalBets, in: 1...100) {
                    HStack {
                        Text("Número total de apuestas")
                        Spacer()
                        Text("\(draft.totalBets)").bold().foregroundColor(.appBrand)
                    }
                }

                TextField("Meta de ganancias (COP)", value: $draft.goal, format: .number)
                    .keyboardType(.numberPad)
                    .fieldStyle()

                Picker("Modalidad de apuestas", selection: $draft.mode) {
                    ForEach(betModes) { mode in
                        Text(mode.label).tag(mode.id)
                    }
                }
                .pickerStyle(.menu)

                TextField("% del capital a arriesgar", value: $draft.riskPercent, format: .number)
                    .keyboardType(.decimalPad)
                    .fieldStyle()

                Stepper(value: $draft.wins, in: 0...draft.totalBets) {
                    HStack {
                        Text("Cantidad de apuestas ganadas")
                        Spacer()
                        Text("\(draft.wins)").bold().foregroundColor(.appSuccess)
                    }
                }

                Stepper(value: $draft.losses, in: 0...draft.totalBets) {
                    HStack {
                        Text("Cantidad de apuestas perdidas")
                        Spacer()
                        Text("\(draft.losses)").bold().foregroundColor(.appDanger)
                    }
                }
            }
        }
        .onAppear { draft = store.config }
        .onChange(of: draft) { newValue in
            store.update { $0 = newValue }
        }
    }
}

private extension View {
    func fieldStyle() -> some View {
        self
            .padding(10)
            .background(Color.appElevated.opacity(0.7))
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
