import SwiftUI

@main
struct BetCalculatorApp: App {
    @StateObject private var store = SimulationStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
                .task { await store.refresh() }
        }
    }
}

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "chart.pie.fill") }
            SimuladorView()
                .tabItem { Label("Simulador", systemImage: "function") }
            EscenariosView()
                .tabItem { Label("Escenarios", systemImage: "chart.bar.xaxis") }
            ProbabilidadesView()
                .tabItem { Label("Probabilidades", systemImage: "percent") }
            HistorialView()
                .tabItem { Label("Historial", systemImage: "clock.arrow.circlepath") }
        }
        .tint(Color.appBrand)
    }
}
