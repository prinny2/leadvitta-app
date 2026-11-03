// Gera um QR code PNG com o CoreImage do macOS (sem dependências).
//   swift scripts/qr.swift "<texto ou URL>" saida.png [tamanho_px]
import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 3 else {
  FileHandle.standardError.write("uso: swift qr.swift <texto> <saida.png> [px]\n".data(using: .utf8)!)
  exit(1)
}
let size = args.count > 3 ? Double(args[3]) ?? 1024 : 1024

let filter = CIFilter.qrCodeGenerator()
filter.message = Data(args[1].utf8)
filter.correctionLevel = "M"
guard let qr = filter.outputImage else { exit(2) }

// Escala sem interpolação e acrescenta margem branca (quiet zone de 4 módulos).
let modules = qr.extent.width + 8
let scale = (size / modules).rounded(.down)
let scaled = qr.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
  .transformed(by: CGAffineTransform(translationX: 4 * scale, y: 4 * scale))
let canvas = CGRect(x: 0, y: 0, width: modules * scale, height: modules * scale)
let image = scaled.composited(over: CIImage(color: .white).cropped(to: canvas))

let context = CIContext()
guard let cg = context.createCGImage(image, from: canvas),
      let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)
else { exit(3) }
CGImageDestinationAddImage(dest, cg, nil)
exit(CGImageDestinationFinalize(dest) ? 0 : 4)
