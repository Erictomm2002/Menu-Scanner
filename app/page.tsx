"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Rocket,
  Zap,
  ShieldCheck,
  Headphones,
} from "lucide-react"

// Navigation Component
function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-[0_12px_32px_rgba(0,105,119,0.08)]">
      <nav className="container mx-auto px-8 py-4 max-w-7xl mx-auto left-0 right-0">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#008080] to-[#20B2AA]">
              iPOS
            </span>
            <span className="text-xl font-light text-slate-400">Kit</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm tracking-tight">
            <a className="text-teal-700 font-bold border-b-2 border-teal-600" href="#">
              Giới thiệu
            </a>
            <a className="text-slate-600 hover:text-teal-600 hover:bg-teal-50/50 transition-all duration-300" href="#">
              Hướng dẫn sử dụng
            </a>
            <a className="text-slate-600 hover:text-teal-600 hover:bg-teal-50/50 transition-all duration-300" href="#">
              Liên hệ
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}

// Hero Section with CTA Buttons
function HeroSection() {
  const handleContractClick = () => {
    window.location.href = "/quotation"
  }

  return (
    <section className="relative overflow-hidden w-full flex flex-col items-center text-center pt-24 pb-32">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-50/40">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10"></div>

        {/* Floating gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-teal-300/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[-10%] w-[45%] h-[60%] bg-cyan-300/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#00808012_1px,transparent_1px),linear-gradient(to_bottom,#00808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_80%,transparent_100%)] z-10"></div>

      <div className="relative z-20 px-8 max-w-7xl mx-auto flex flex-col items-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 rounded-3xl bg-white shadow-[0_8px_32px_rgba(0,128,128,0.15)] border border-teal-100 flex items-center justify-center relative group group-hover:scale-105 transition-transform duration-300 cursor-default">
            <div className="absolute inset-0 rounded-3xl bg-teal-400 opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>
            <Sparkles className="text-[#008080] text-3xl relative z-10" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl tracking-tighter mb-8 drop-shadow-sm font-bold"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500">
            iPOS
          </span>
          <span className="font-light text-slate-400 md:text-7xl ml-2 tracking-normal">Kit</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 font-medium leading-relaxed"
        >
          Bộ công cụ hỗ trợ iPOS Salesman triển khai giải pháp F&B nhanh chóng và hiệu quả
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link
            href="/menu-extractor"
            className="group relative px-8 py-4 bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-[0_12px_24px_rgba(0,128,128,0.25)] hover:shadow-[0_16px_32px_rgba(0,128,128,0.4)] transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden border border-teal-400/50"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Menu Extractor <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <button
            onClick={handleContractClick}
            className="group relative px-8 py-4 bg-white text-teal-700 border-2 border-teal-100/80 hover:border-teal-300 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <div className="absolute inset-0 w-full h-full bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Làm Hợp Đồng
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}

// Why Choose Section (Bento Grid Style)
function WhyChooseSection() {
  const advantages = [
    {
      icon: Rocket,
      title: "Tăng tốc độ triển khai lên 300%",
      description: "Rút ngắn thời gian từ khâu tiếp nhận đến khi vận hành thực tế.",
    },
    {
      icon: Zap,
      title: "Tự động hóa quy trình làm việc",
      description: "Loại bỏ các công việc lặp đi lặp lại bằng trí tuệ nhân tạo.",
    },
    {
      icon: ShieldCheck,
      title: "Giảm thiểu sai sót thủ công",
      description: "Đảm bảo tính chính xác tuyệt đối trong dữ liệu menu và hợp đồng.",
    },
    {
      icon: Headphones,
      title: "Chuyên nghiệp hóa tư vấn",
      description: "Nâng cao vị thế của Salesman trong mắt khách hàng F&B.",
    },
  ]

  return (
    <section className="relative px-8 py-20 bg-surface-container-low overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="mb-16">
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
            Ưu thế vượt trội
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
            Tại sao chọn iPOS Kit?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-surface-container-lowest p-8 rounded-xl shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Feature Cards Section
function FeatureCardsSection() {
  const features = [
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwRUkWJcpjpFXlsbx75gXPjXyzglf3TbVez5VGyKEN_U0XG-pJz8RXz636Z2awhc0KAk3QWJ5GQI6rHn22TITwtVaL1ONl3WHLgk0of1r_TfPj4ws5aM1XOinlJ6ZYwbyXvLpjYyFJE1fLGQt_pc4ZhfeYl-xtCWPRFda_5aotKU7Sw3-JCcSw1GTTW9qDhjawF9nBWRAeGOz8Vwcu-cY5SLeWv_ABb6w0S074YvY81VEUibvY0awiz7cFYl_DFySRYuBWk1aoXgxe",
      title: "Menu Extractor",
      description: "Trích xuất dữ liệu menu từ ảnh và PDF tự động với độ chính xác cao.",
      href: "/menu-extractor",
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFciSLDq68NsxX7zDXjS2xvs_XkcQHgLVpCR21y6YCZCMQfK0Wx21MIlsy5NkQ6ReN551TH8VklVNMdsT_HoPRpE-hQp0EF5x0VxEPXrM3lrj5kIQWA09Asv0fkd_l6o9mdXeux3whT7V2SvJp8p4eB4gmRVgWHvloStJzh2vfQ7W-ZWewjtBRpf75rUXaQa6sZVCZZl0KwJFO1aehBN0q-DRO1na1WkW0aL4katN-5f3xijhZ5ZWRa-z55_gfZ7eABlbM_7Dw0DGk",
      title: "Làm Hợp Đồng",
      description: "Tạo báo giá và hợp đồng nhanh chóng thông qua các mẫu chuẩn hóa.",
      href: "/quotation",
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXjshtrkoJRQ0y9A1wU0AfMI8G-34t6cbKb8Nl6S1rjJnRZtDXe7sZLZnrF-OtGk1mWM8S9L4I3pIERt8Ih9oWucm-5qpdlViszgQ5r2RAWnloemz-mNYMURl_Aj-zkCkikoDRPQKAly4aoHQWPe_ZhaexEUskZjyiWXibFE8ffcBYWFlDcxLC7cQBR3tQwrwic6bXL_73iADdneqnov70z5YXBKti20CHTLMA8LMhdQ3WZpCMnqNCgpOA-whQ26FesiFVql9qOpTe",
      title: "Dashboard",
      description: "Theo dõi tiến độ triển khai và hiệu suất bán hàng theo thời gian thực.",
      comingSoon: true,
    },
  ]

  return (
    <section className="relative px-8 py-24 max-w-7xl mx-auto">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(0,105,119,0.04)] border border-outline-variant/10"
          >
            <div className="aspect-video bg-surface-container-high relative overflow-hidden">
              <img
                alt={feature.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={feature.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-60"></div>
              {feature.comingSoon && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 text-on-primary text-xs font-bold rounded-full">
                  Sắp ra mắt
                </div>
              )}
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-extrabold mb-3 text-on-surface">{feature.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>

              {feature.href && (
                <Link
                  href={feature.href}
                  className="mt-8 flex items-center text-primary font-bold group-hover:gap-2 transition-all"
                >
                  Tìm hiểu thêm <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}

              {feature.comingSoon && (
                <div className="mt-8 flex items-center text-on-surface-variant font-bold">
                  Đang phát triển...
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// Value Proposition Section
function ValuePropositionSection() {
  const stats = [
    { value: "500+", label: "Salesmen" },
    { value: "10k+", label: "Hợp đồng" },
    { value: "15k+", label: "Menus" },
    { value: "30%", label: "Năng suất" },
  ]

  return (
    <section className="relative px-8 py-24 bg-surface overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto text-center relative">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-8 shadow-xl shadow-primary/20">
          <span className="text-on-primary text-3xl font-bold">👥</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface mb-8 tracking-tight">
          Trao quyền cho đội ngũ iPOS Salesman
        </h2>

        <div className="h-1 w-24 bg-primary mx-auto mb-8 rounded-full"></div>

        <p className="text-xl text-on-surface-variant leading-relaxed font-body">
          Được thiết kế bởi đội ngũ iPOS để hỗ trợ các salesman làm việc hiệu quả hơn, nhanh chóng
          hơn và chuyên nghiệp hơn với khách hàng F&B tại Việt Nam.
        </p>

        {/* Stats */}
        <div className="mt-16 p-10 bg-surface-container-low rounded-[2rem] border border-outline-variant/20 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-primary mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="w-full py-8 px-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 font-body text-xs text-slate-500">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <span className="font-medium text-slate-700">
          © 2024 iPOS Vietnam. Bộ công cụ nội bộ cho iPOS Salesman.
        </span>
      </div>
      <div className="flex gap-6">
        <a className="text-slate-500 hover:text-teal-500 hover:underline transition-all" href="#">
          Điều khoản
        </a>
        <a className="text-slate-500 hover:text-teal-500 hover:underline transition-all" href="#">
          Bảo mật
        </a>
        <a className="text-slate-500 hover:text-teal-500 hover:underline transition-all" href="#">
          Hỗ trợ
        </a>
      </div>
    </footer>
  )
}

// Main Home Component
export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />
      <HeroSection />
      <WhyChooseSection />
      <FeatureCardsSection />
      <ValuePropositionSection />
      <Footer />
    </main>
  )
}
