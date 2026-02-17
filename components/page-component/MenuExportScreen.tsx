"use client"

import { MenuData } from "@/types/menu"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { Download, Check, ArrowLeft, FileSpreadsheet, FolderOpen } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-2">
            {hasExportedBoth
              ? "Hoàn tất xuất file"
              : hasExportedAny
                ? "Xuất file thành công"
                : "Sẵn sàng xuất file"}
          </h1>
          <p className="text-white/80">
            {hasExportedBoth
              ? "Tất cả file đã được xuất thành công. Bạn có thể tải lại hoặc quay về chỉnh sửa."
              : hasExportedAny
                ? "Tiếp tục xuất file còn lại hoặc tải lại file đã xuất"
                : "Chọn loại file bạn muốn xuất"}
          </p>
          <p className="mt-2 text-sm text-cyan-300 font-semibold">
            Sản phẩm của OSCAR TEAM. Chúc anh em OSCAR TEAM về 100% số cuối tháng!
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="glass" className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/70">Tên nhà hàng</label>
                  <p className="text-xl font-semibold text-white mt-1">{restaurantName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-500/20 rounded-2xl p-5">
                    <p className="text-3xl font-bold text-purple-300">{totalItems}</p>
                    <p className="text-sm text-white/60">Tổng số món</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-2xl p-5">
                    <p className="text-3xl font-bold text-blue-300">{categories.length}</p>
                    <p className="text-sm text-white/60">Số nhóm món</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/70 block mb-3">
                    Các nhóm món trong thực đơn
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <motion.span
                        key={cat}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-xl text-sm font-medium border border-purple-400/20"
                      >
                        {cat}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Status Cards */}
        <AnimatePresence>
          {hasExportedAny && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 space-y-3"
            >
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">
                Trạng thái xuất file
              </h3>

              {/* Menu Export Status */}
              {exportedFiles.menu && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-500/10 backdrop-blur-md border border-green-400/30 rounded-2xl"
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="bg-green-500 rounded-full p-3">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSpreadsheet className="w-5 h-5 text-green-400" />
                        <h4 className="font-semibold text-white">File Menu Excel</h4>
                      </div>
                      <p className="text-sm text-white/60">
                        {restaurantName}_menu.xlsx • {totalItems} món
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Category Export Status */}
              {exportedFiles.category && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-blue-500/10 backdrop-blur-md border border-blue-400/30 rounded-2xl"
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="bg-blue-500 rounded-full p-3">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderOpen className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white">File Nhóm món Excel</h4>
                      </div>
                      <p className="text-sm text-white/60">
                        {restaurantName}_categories.xlsx • {categories.length} nhóm
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Menu Export Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                variant="glass"
                className={`border-2 transition-all ${exportedFiles.menu
                    ? "border-green-400/50 bg-green-500/10"
                    : "border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                  }`}
              >
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500/20 rounded-xl p-3">
                        <FileSpreadsheet className="w-6 h-6 text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">File Menu</h4>
                        <p className="text-sm text-white/60 mt-1">
                          Xuất 22 cột đầy đủ thông tin món ăn
                        </p>
                      </div>
                      {exportedFiles.menu && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-500 rounded-full p-2"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <Button
                      onClick={handleExportMenu}
                      disabled={exporting !== null}
                      variant="default"
                      gradient="purple-blue"
                      glow
                      className="w-full"
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
            </motion.div>

            {/* Category Export Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                variant="glass"
                className={`border-2 transition-all ${exportedFiles.category
                    ? "border-blue-400/50 bg-blue-500/10"
                    : "border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-500/10"
                  }`}
              >
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/20 rounded-xl p-3">
                        <FolderOpen className="w-6 h-6 text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">File Nhóm món</h4>
                        <p className="text-sm text-white/60 mt-1">
                          Xuất danh sách tên và mã nhóm món
                        </p>
                      </div>
                      {exportedFiles.category && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-blue-500 rounded-full p-2"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <Button
                      onClick={handleExportCategory}
                      disabled={exporting !== null}
                      variant="default"
                      gradient="blue-cyan"
                      glow
                      className="w-full"
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
            </motion.div>
          </div>

          {/* Back Button */}
          <Button
            variant="glass"
            onClick={onBack}
            className="w-full text-white/80 hover:text-white"
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
