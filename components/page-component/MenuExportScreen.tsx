"use client"

import { MenuData } from "@/types/menu"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { Download, Check, ArrowLeft, FileSpreadsheet, FolderOpen } from "lucide-react"
import { useState } from "react"

type ExportType = "menu" | "category" | null

interface ExportStatus {
  menu: boolean
  category: boolean
}

interface MenuExportScreenProps {
  restaurantName: string
  menuData: MenuData
  onBack: () => void
}

export default function MenuExportScreen({ restaurantName, menuData, onBack }: MenuExportScreenProps) {
  const [exporting, setExporting] = useState<ExportType>(null)
  const [exportedFiles, setExportedFiles] = useState<ExportStatus>({
    menu: false,
    category: false,
  })

  const handleExportMenu = async () => {
    setExporting("menu")
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Xuất file thất bại")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const timestamp = new Date().toISOString().split("T")[0]
      const restaurantName = menuData?.restaurantName
        ? menuData.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")
        : "menu"
      a.download = `${restaurantName}_menu_${timestamp}.xlsx`

      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportedFiles((prev) => ({ ...prev, menu: true }))
      alert("✅ Xuất file Menu Excel thành công!")
    } catch (error) {
      console.error("Error exporting menu:", error)
      alert("❌ " + (error || "Lỗi xuất file Menu Excel. Vui lòng thử lại."))
    } finally {
      setExporting(null)
    }
  }

  const handleExportCategory = async () => {
    setExporting("category")
    try {
      const response = await fetch("/api/category-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Xuất file thất bại")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const timestamp = new Date().toISOString().split("T")[0]
      const restaurantName = menuData?.restaurantName
        ? menuData.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")
        : "categories"
      a.download = `${restaurantName}_categories_${timestamp}.xlsx`

      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportedFiles((prev) => ({ ...prev, category: true }))
      alert("✅ Xuất file Nhóm món Excel thành công!")
    } catch (error) {
      console.error("Error exporting category:", error)
      alert("❌ " + (error || "Lỗi xuất file Nhóm món. Vui lòng thử lại."))
    } finally {
      setExporting(null)
    }
  }

  const categories = [...new Set(menuData.categories.map((cat) => cat.categoryName))]
  const totalItems = menuData.categories.reduce((sum, cat) => sum + cat.items.length, 0)
  const hasExportedAny = exportedFiles.menu || exportedFiles.category
  const hasExportedBoth = exportedFiles.menu && exportedFiles.category

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {hasExportedBoth
              ? "Hoàn tất xuất file"
              : hasExportedAny
                ? "Xuất file thành công"
                : "Sẵn sàng xuất file"}
          </h1>
          <p className="text-muted-foreground">
            {hasExportedBoth
              ? "Tất cả file đã được xuất thành công. Bạn có thể tải lại hoặc quay về chỉnh sửa."
              : hasExportedAny
                ? "Tiếp tục xuất file còn lại hoặc tải lại file đã xuất"
                : "Chọn loại file bạn muốn xuất"}
          </p>
          <p className="mt-2 text-sm text-primary font-semibold">
            Sản phẩm của OSCAR TEAM. Chúc anh em OSCAR TEAM về 100% số cuối tháng!
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 border-border">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tên nhà hàng</label>
                <p className="text-lg font-semibold text-foreground mt-1">{restaurantName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">{totalItems}</p>
                  <p className="text-sm text-muted-foreground">Tổng số món</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Số nhóm món</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Các nhóm món trong thực đơn
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Status Cards */}
        {hasExportedAny && (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Trạng thái xuất file
            </h3>

            {/* Menu Export Status */}
            {exportedFiles.menu && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-700" />
                        <h4 className="font-semibold text-foreground">File Menu Excel</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {restaurantName}_menu.xlsx • {totalItems} món
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Export Status */}
            {exportedFiles.category && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 rounded-full p-2">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-blue-700" />
                        <h4 className="font-semibold text-foreground">File Nhóm món Excel</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {restaurantName}_categories.xlsx • {categories.length} nhóm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Export Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Menu Export Button */}
            <Card className={`border-2 transition-all ${exportedFiles.menu
                ? "border-green-200 bg-green-50/50 dark:bg-green-950/10"
                : "border-primary/30 hover:border-primary"
              }`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">File Menu</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Xuất 22 cột đầy đủ thông tin món ăn
                      </p>
                    </div>
                    {exportedFiles.menu && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <Button
                    onClick={handleExportMenu}
                    disabled={exporting !== null}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exporting === "menu"
                      ? "Đang xuất..."
                      : exportedFiles.menu
                        ? "Tải lại Menu"
                        : "Xuất Menu"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category Export Button */}
            <Card className={`border-2 transition-all ${exportedFiles.category
                ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/10"
                : "border-blue-400/30 hover:border-blue-400"
              }`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500/10 rounded-lg p-2">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">File Nhóm món</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Xuất danh sách tên và mã nhóm món
                      </p>
                    </div>
                    {exportedFiles.category && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <Button
                    onClick={handleExportCategory}
                    disabled={exporting !== null}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exporting === "category"
                      ? "Đang xuất..."
                      : exportedFiles.category
                        ? "Tải lại Nhóm món"
                        : "Xuất Nhóm món"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-border"
            disabled={exporting !== null}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại chỉnh sửa
          </Button>
        </div>
      </div>
    </div>
  )
}
// "use client"

// import { MenuData } from "@/types/menu"
// import { Button } from "../ui/Button"
// import { Card, CardContent } from "../ui/Card"
// import { Download, Check, ArrowLeft } from "lucide-react"
// import { useState } from "react"


// interface MenuExportScreenProps {
//   restaurantName: string
//   menuData: MenuData
//   onBack: () => void
// }

// export default function MenuExportScreen({ restaurantName, menuData, onBack }: MenuExportScreenProps) {
//   const [exporting, setExporting] = useState(false)
//   const [isExported, setIsExported] = useState(false)

//   const handleExport = async () => {
//     setExporting(true);
//     try {
//       const response = await fetch("/api/export", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(menuData),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Xuất file thất bại");
//       }

//       // Download file
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;

//       const timestamp = new Date().toISOString().split("T")[0];
//       const restaurantName = menuData?.restaurantName
//         ? menuData.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")
//         : "menu";
//       a.download = `${restaurantName}_${timestamp}.xlsx`;

//       document.body.appendChild(a);
//       a.click();

//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//       // Success notification
//       alert("✅ Xuất file Excel thành công!");
//       setIsExported(true);
//     } catch (error) {
//       console.error("Error exporting:", error);
//       alert("❌ " + (error || "Lỗi xuất file Excel. Vui lòng thử lại."));
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleExportCategory = async () => {
//     setExporting(true);
//     try {
//       const response = await fetch("/api/category-export", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(menuData),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Xuất file thất bại");
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;

//       const timestamp = new Date().toISOString().split("T")[0];
//       const restaurantName = menuData?.restaurantName
//         ? menuData.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")
//         : "categories";
//       a.download = `${restaurantName}_categories_${timestamp}.xlsx`;

//       document.body.appendChild(a);
//       a.click();

//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//       alert("✅ Xuất file nhóm món thành công!");
//     } catch (error) {
//       console.error("Error exporting:", error);
//       alert("❌ " + (error || "Lỗi xuất file nhóm món. Vui lòng thử lại."));
//     } finally {
//       setExporting(false);
//     }
//   };

//   const categories = [...new Set(menuData.categories.map((cat) => cat.categoryName))]
//   const totalItems = menuData.categories.reduce((sum, cat) => sum + cat.items.length, 0)

//   return (
//     <div className="min-h-screen bg-background py-8 px-4">
//       <div className="max-w-2xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">
//             {isExported ? "Xuất file thành công" : "Sẵn sàng xuất file"}
//           </h1>
//           <p className="text-muted-foreground">
//             {isExported
//               ? "Thực đơn của bạn đã được xuất ra file Excel"
//               : "Vui lòng kiểm tra lại dữ liệu trước khi xuất file"}
//           </p>
//           <p className="mt-2 text-sm text-primary font-semibold">
//             Sản phẩm của OSCAR TEAM. Chúc anh em OSCAR TEAM về 100% số cuối tháng!
//           </p>
//         </div>

//         {!isExported && (
//           <Card className="mb-6 border-border">
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Tên nhà hàng</label>
//                   <p className="text-lg font-semibold text-foreground mt-1">{restaurantName}</p>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="bg-muted rounded-lg p-4">
//                     <p className="text-2xl font-bold text-primary">{totalItems}</p>
//                     <p className="text-sm text-muted-foreground">Món ăn</p>
//                   </div>
//                   <div className="bg-muted rounded-lg p-4">
//                     <p className="text-2xl font-bold text-primary">{categories.length}</p>
//                     <p className="text-sm text-muted-foreground">Nhóm món</p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground block mb-2">Các nhóm món trong thực đơn</label>
//                   <div className="flex flex-wrap gap-2">
//                     {categories.map((cat) => (
//                       <span key={cat} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium">
//                         {cat}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {isExported && (
//           <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
//             <CardContent className="p-6">
//               <div className="flex items-center gap-4">
//                 <div className="bg-green-500 rounded-full p-3">
//                   <Check className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-foreground">File: {restaurantName}_menu.xlsx</h3>
//                   <p className="text-sm text-muted-foreground">{totalItems} món đã được xuất thành công</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         <div className="flex gap-3">
//           <Button variant="outline" onClick={onBack} className="border-border">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Quay lại
//           </Button>
//           {!isExported ? (
//             <>
//               <Button
//                 onClick={handleExport}
//                 disabled={exporting}
//                 className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 {exporting ? "Đang xuất file..." : "Xuất ra Excel"}
//               </Button>
//               <Button
//                 onClick={handleExportCategory}
//                 disabled={exporting}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 {exporting ? "Đang xuất nhóm món..." : "Tải nhóm món Excel"}
//               </Button>
//             </>
//           ) : (
//             <Button
//               onClick={() => {
//                 setIsExported(false)
//                 handleExport()
//               }}
//               className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
//             >
//               <Download className="w-4 h-4 mr-2" />
//               Tải lại file
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
