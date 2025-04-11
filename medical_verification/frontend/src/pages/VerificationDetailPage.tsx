import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  User,
  CreditCard,
  Building,
  ArrowLeft,
  Shield,
  Eye,
  CheckCheck,
  X,
  AlertTriangle,
} from "lucide-react";

const verificationSchema = z.object({
  status: z.enum(["approved", "rejected", "needs_review"]),
  notes: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

const mockVerificationRequest = {
  id: 1,
  doctorName: "张医生",
  hospital: "北京协和医院",
  department: "心脏内科",
  position: "主任医师",
  status: "pending",
  riskLevel: "medium",
  submittedAt: "2025-04-10T10:30:00Z",
};

interface VerificationDetailPageProps {
  requestId?: number;
  onBack?: () => void;
}

export default function VerificationDetailPage({ requestId = 1, onBack }: VerificationDetailPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState(mockVerificationRequest);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      status: "needs_review",
      notes: "",
    },
  });

  useEffect(() => {
    setVerificationRequest(mockVerificationRequest);
  }, [requestId]);

  async function onSubmit(data: VerificationFormValues) {
    setIsLoading(true);
    
    try {
      console.log("Submitting verification decision:", data);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationRequest({
        ...verificationRequest,
        status: data.status,
      });
      
      alert("审核决定已提交");
      
    } catch (error) {
      console.error("Error submitting verification decision:", error);
      alert("提交失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              审核详情 #{verificationRequest.id}
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Doctor info card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>医生基本信息</CardTitle>
              <CardDescription>申请时间: {new Date(verificationRequest.submittedAt).toLocaleString('zh-CN')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">姓名:</span>
                    <span className="ml-2">{verificationRequest.doctorName}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">医院:</span>
                    <span className="ml-2">{verificationRequest.hospital}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">科室:</span>
                    <span className="ml-2">{verificationRequest.department}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">职位:</span>
                    <span className="ml-2">{verificationRequest.position}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification form */}
          <Card>
            <CardHeader>
              <CardTitle>审核决定</CardTitle>
              <CardDescription>请根据AI分析结果和您的专业判断做出审核决定</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>审核结果</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="approved" id="approved" />
                              <Label htmlFor="approved" className="flex items-center">
                                <CheckCheck className="h-4 w-4 mr-2 text-green-600" />
                                通过审核
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rejected" id="rejected" />
                              <Label htmlFor="rejected" className="flex items-center">
                                <X className="h-4 w-4 mr-2 text-red-600" />
                                拒绝审核
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="needs_review" id="needs_review" />
                              <Label htmlFor="needs_review" className="flex items-center">
                                <Eye className="h-4 w-4 mr-2 text-yellow-600" />
                                需要进一步审核
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>审核备注</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="请输入审核备注..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "提交中..." : "提交审核决定"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
