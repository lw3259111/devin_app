import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  FileText, UserCheck, AlertTriangle, Clock, CheckCircle, XCircle, 
  AlertCircle, BarChart2, List, Upload
} from "lucide-react";

const statsData = [
  { name: "总申请", value: 120, icon: FileText, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { name: "已审核", value: 85, icon: UserCheck, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { name: "需人工审核", value: 12, icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  { name: "平均处理时间", value: "1.5小时", icon: Clock, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
];

const statusData = [
  { name: "已通过", value: 65, color: "#10b981" },
  { name: "已拒绝", value: 20, color: "#ef4444" },
  { name: "待审核", value: 35, color: "#f59e0b" },
];

const riskData = [
  { name: "低风险", value: 70, color: "#10b981" },
  { name: "中风险", value: 40, color: "#f59e0b" },
  { name: "高风险", value: 10, color: "#ef4444" },
];

const verificationRequests = [
  {
    id: 1,
    doctorName: "张医生",
    hospital: "北京协和医院",
    department: "心脏内科",
    status: "pending",
    riskLevel: "low",
    submittedAt: "2025-04-10T10:30:00Z",
  },
  {
    id: 2,
    doctorName: "李医生",
    hospital: "北京大学第一医院",
    department: "神经外科",
    status: "needs_review",
    riskLevel: "high",
    submittedAt: "2025-04-10T09:15:00Z",
  },
  {
    id: 3,
    doctorName: "王医生",
    hospital: "中国医学科学院肿瘤医院",
    department: "肿瘤科",
    status: "approved",
    riskLevel: "low",
    submittedAt: "2025-04-09T16:45:00Z",
  },
  {
    id: 4,
    doctorName: "刘医生",
    hospital: "北京天坛医院",
    department: "神经内科",
    status: "rejected",
    riskLevel: "medium",
    submittedAt: "2025-04-09T14:20:00Z",
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="w-3 h-3 mr-1" /> 已通过</span>;
    case "rejected":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><XCircle className="w-3 h-3 mr-1" /> 已拒绝</span>;
    case "needs_review":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><AlertCircle className="w-3 h-3 mr-1" /> 需人工审核</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><Clock className="w-3 h-3 mr-1" /> 待审核</span>;
  }
};

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case "low":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">低风险</span>;
    case "medium":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">中风险</span>;
    case "high":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">高风险</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">未知</span>;
  }
};

interface DashboardPageProps {
  onLogout?: () => void;
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold">医疗身份审核平台</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              <Button 
                variant={activeTab === "overview" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("overview")}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                数据概览
              </Button>
              <Button 
                variant={activeTab === "verification" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("verification")}
              >
                <List className="mr-2 h-4 w-4" />
                审核列表
              </Button>
              <Button 
                variant={activeTab === "upload" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                上传文档
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeTab === "overview" && "数据概览"}
              {activeTab === "verification" && "审核列表"}
              {activeTab === "upload" && "上传文档"}
            </h1>
            <div className="flex items-center">
              <Button variant="outline" onClick={() => {
                localStorage.removeItem("token");
                if (onLogout) {
                  onLogout();
                }
                navigate("/login");
              }}>
                退出登录
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="md:hidden mb-4">
              <TabsTrigger value="overview">数据概览</TabsTrigger>
              <TabsTrigger value="verification">审核列表</TabsTrigger>
              <TabsTrigger value="upload">上传文档</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${stat.color}`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                          <p className="text-2xl font-semibold">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>审核状态分布</CardTitle>
                    <CardDescription>各状态的审核请求数量</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statusData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="数量">
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>风险等级分布</CardTitle>
                    <CardDescription>各风险等级的审核请求数量</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {riskData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>审核请求列表</CardTitle>
                  <CardDescription>所有待处理和已处理的审核请求</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3">ID</th>
                          <th scope="col" className="px-6 py-3">医生姓名</th>
                          <th scope="col" className="px-6 py-3">医院</th>
                          <th scope="col" className="px-6 py-3">科室</th>
                          <th scope="col" className="px-6 py-3">状态</th>
                          <th scope="col" className="px-6 py-3">风险等级</th>
                          <th scope="col" className="px-6 py-3">提交时间</th>
                          <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verificationRequests.map((request) => (
                          <tr key={request.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4">{request.id}</td>
                            <td className="px-6 py-4">{request.doctorName}</td>
                            <td className="px-6 py-4">{request.hospital}</td>
                            <td className="px-6 py-4">{request.department}</td>
                            <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                            <td className="px-6 py-4">{getRiskBadge(request.riskLevel)}</td>
                            <td className="px-6 py-4">{formatDate(request.submittedAt)}</td>
                            <td className="px-6 py-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/verification/${request.id}`)}
                              >
                                查看详情
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>上传文档</CardTitle>
                  <CardDescription>上传医生身份证明文档进行智能审核</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">身份证</h3>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <Button variant="outline" onClick={() => navigate(`/upload/1`)}>选择文件</Button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            支持 JPG, PNG, PDF 格式，最大 5MB
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">人脸照片</h3>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <Button variant="outline" onClick={() => navigate(`/upload/1`)}>选择文件</Button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            支持 JPG, PNG 格式，最大 5MB
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">工作证</h3>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <Button variant="outline" onClick={() => navigate(`/upload/1`)}>选择文件</Button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            支持 JPG, PNG, PDF 格式，最大 5MB
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">银行卡</h3>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <Button variant="outline" onClick={() => navigate(`/upload/1`)}>选择文件</Button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            支持 JPG, PNG 格式，最大 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <AlertDescription>
                        所有文档将通过AI智能审核系统进行处理，确保信息安全和隐私保护。
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end">
                      <Button>提交审核</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
