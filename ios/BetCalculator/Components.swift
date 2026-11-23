import SwiftUI

// MARK: - Formato

func formatCOP(_ value: Double) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = "COP"
    formatter.locale = Locale(identifier: "es_CO")
    formatter.minimumFractionDigits = 0
    formatter.maximumFractionDigits = 0
    return formatter.string(from: NSNumber(value: value)) ?? "$0"
}

func formatNumber(_ value: Double, decimals: Int = 2) -> String {
    let formatter = NumberFormatter()
    formatter.locale = Locale(identifier: "es_CO")
    formatter.minimumFractionDigits = 0
    formatter.maximumFractionDigits = decimals
    return formatter.string(from: NSNumber(value: value)) ?? "0"
}

func formatPercent(_ value: Double, decimals: Int = 2) -> String {
    "\(formatNumber(value, decimals: decimals))%"
}

// MARK: - Componentes visuales

struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    let icon: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
                .frame(width: 40, height: 40)
                .background(color.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.headline)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.appElevated.opacity(0.7))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

struct CardView<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            content
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.appCard)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Color.white.opacity(0.06), lineWidth: 1)
        )
    }
}

struct ResultBadge: View {
    let result: String

    var body: some View {
        switch result {
        case "ganada":
            Label("Ganada", systemImage: "checkmark.circle.fill")
                .font(.caption).fontWeight(.semibold)
                .foregroundColor(.appSuccess)
        case "perdida":
            Label("Perdida", systemImage: "xmark.circle.fill")
                .font(.caption).fontWeight(.semibold)
                .foregroundColor(.appDanger)
        default:
            Label("Sin fondos", systemImage: "nosign")
                .font(.caption).fontWeight(.semibold)
                .foregroundColor(.secondary)
        }
    }
}
