import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";
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
  FileText,
  User,
  CreditCard,
  Building,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const uploadSchema = z.object({
  idCard: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "身份证照片是必需的")
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      "文件大小不能超过5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "只接受 .jpg, .jpeg, .png 和 .webp 格式的图片"
    ),
  facePhoto: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "人脸照片是必需的")
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      "文件大小不能超过5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "只接受 .jpg, .jpeg, .png 和 .webp 格式的图片"
    ),
  workBadge: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "工作证照片是必需的")
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      "文件大小不能超过5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "只接受 .jpg, .jpeg, .png 和 .webp 格式的图片"
    ),
  bankCard: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "银行卡照片是必需的")
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      "文件大小不能超过5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "只接受 .jpg, .jpeg, .png 和 .webp 格式的图片"
    ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface DocumentUploadPageProps {
  requestId?: number;
  onBack?: () => void;
  onComplete?: () => void;
}

export default function DocumentUploadPage({ requestId = 1, onBack, onComplete }: DocumentUploadPageProps) {
  const [activeTab, setActiveTab] = useState("id-card");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    idCard: "idle" | "uploading" | "success" | "error";
    facePhoto: "idle" | "uploading" | "success" | "error";
    workBadge: "idle" | "uploading" | "success" | "error";
    bankCard: "idle" | "uploading" | "success" | "error";
  }>({
    idCard: "idle",
    facePhoto: "idle",
    workBadge: "idle",
    bankCard: "idle",
  });
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  });

  async function uploadFile(file: File, type: "idCard" | "facePhoto" | "workBadge" | "bankCard") {
    setUploadStatus(prev => ({ ...prev, [type]: "uploading" }));
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const endpoint = {
        idCard: `/api/verification-requests/${requestId}/id-card`,
        facePhoto: `/api/verification-requests/${requestId}/face`,
        workBadge: `/api/verification-requests/${requestId}/work-badge`,
        bankCard: `/api/verification-requests/${requestId}/bank-card`,
      }[type];
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }
      
      setUploadStatus(prev => ({ ...prev, [type]: "success" }));
      return true;
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setUploadStatus(prev => ({ ...prev, [type]: "error" }));
      setError(err instanceof Error ? err.message : "上传过程中出现错误");
      return false;
    }
  }

  async function onSubmit(data: UploadFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      const idCardSuccess = await uploadFile(data.idCard[0], "idCard");
      const facePhotoSuccess = await uploadFile(data.facePhoto[0], "facePhoto");
      const workBadgeSuccess = await uploadFile(data.workBadge[0], "workBadge");
      const bankCardSuccess = await uploadFile(data.bankCard[0], "bankCard");
      
      if (idCardSuccess && facePhotoSuccess && workBadgeSuccess && bankCardSuccess) {
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传过程中出现错误");
    } finally {
      setIsLoading(false);
    }
  }

  const renderUploadStatus = (type: "idCard" | "facePhoto" | "workBadge" | "bankCard") => {
    const status = uploadStatus[type];
    
    if (status === "idle") return null;
    if (status === "uploading") return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

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
              上传证件 #{requestId}
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>证件上传</CardTitle>
              <CardDescription>请上传医生身份验证所需的所有证件</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="id-card" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="id-card" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    身份证
                    {renderUploadStatus("idCard")}
                  </TabsTrigger>
                  <TabsTrigger value="face-photo" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    人脸照片
                    {renderUploadStatus("facePhoto")}
                  </TabsTrigger>
                  <TabsTrigger value="work-badge" className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    工作证
                    {renderUploadStatus("workBadge")}
                  </TabsTrigger>
                  <TabsTrigger value="bank-card" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    银行卡
                    {renderUploadStatus("bankCard")}
                  </TabsTrigger>
                </TabsList>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TabsContent value="id-card">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            上传身份证正面照片
                          </p>
                          <FormField
                            control={form.control}
                            name="idCard"
                            render={({ field: { onChange, value, ...rest } }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) => onChange(e.target.files)}
                                    className="w-full"
                                    {...rest}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("face-photo")}
                          className="w-full"
                        >
                          下一步
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="face-photo">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            上传人脸照片（正面免冠照）
                          </p>
                          <FormField
                            control={form.control}
                            name="facePhoto"
                            render={({ field: { onChange, value, ...rest } }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) => onChange(e.target.files)}
                                    className="w-full"
                                    {...rest}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab("id-card")}
                            className="flex-1"
                          >
                            上一步
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setActiveTab("work-badge")}
                            className="flex-1"
                          >
                            下一步
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="work-badge">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            上传医院工作证照片
                          </p>
                          <FormField
                            control={form.control}
                            name="workBadge"
                            render={({ field: { onChange, value, ...rest } }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) => onChange(e.target.files)}
                                    className="w-full"
                                    {...rest}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab("face-photo")}
                            className="flex-1"
                          >
                            上一步
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setActiveTab("bank-card")}
                            className="flex-1"
                          >
                            下一步
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bank-card">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            上传银行卡照片
                          </p>
                          <FormField
                            control={form.control}
                            name="bankCard"
                            render={({ field: { onChange, value, ...rest } }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) => onChange(e.target.files)}
                                    className="w-full"
                                    {...rest}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab("work-badge")}
                            className="flex-1"
                          >
                            上一步
                          </Button>
                          <Button 
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                          >
                            {isLoading ? "上传中..." : "提交所有文件"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </form>
                </Form>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                所有文件将通过加密通道传输并安全存储
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
