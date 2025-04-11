import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  FileText, 
  User, 
  CreditCard, 
  Building,
  AlertCircle,
  Brain
} from "lucide-react";

interface AIAnalysisProps {
  documentType: "idCard" | "face" | "workBadge" | "bankCard";
  analysisData: {
    confidence: number;
    riskLevel: "low" | "medium" | "high";
    verificationStatus: "pending" | "approved" | "rejected" | "needs_review";
    matchScore?: number;
    livenessScore?: number;
    ocrConfidence?: number;
    anomalies?: string[];
    verificationNotes?: string;
  };
}

export default function AIAnalysisCard({ documentType, analysisData }: AIAnalysisProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const getDocumentIcon = () => {
    switch (documentType) {
      case "idCard":
        return <FileText className="h-5 w-5" />;
      case "face":
        return <User className="h-5 w-5" />;
      case "workBadge":
        return <Building className="h-5 w-5" />;
      case "bankCard":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };
  
  const getDocumentTitle = () => {
    switch (documentType) {
      case "idCard":
        return "身份证分析";
      case "face":
        return "人脸识别分析";
      case "workBadge":
        return "工作证分析";
      case "bankCard":
        return "银行卡分析";
      default:
        return "文档分析";
    }
  };
  
  const getStatusIcon = () => {
    switch (analysisData.verificationStatus) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "needs_review":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getStatusText = () => {
    switch (analysisData.verificationStatus) {
      case "approved":
        return "已通过";
      case "rejected":
        return "已拒绝";
      case "needs_review":
        return "需要人工审核";
      default:
        return "待审核";
    }
  };
  
  const getRiskBadge = () => {
    switch (analysisData.riskLevel) {
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">低风险</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">中等风险</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">高风险</Badge>;
      default:
        return <Badge variant="outline">未知风险</Badge>;
    }
  };
  
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-green-500";
    if (score >= 0.7) return "text-yellow-500";
    return "text-red-500";
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getDocumentIcon()}
            <CardTitle className="text-lg">{getDocumentTitle()}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>AI 智能分析结果</span>
          {getRiskBadge()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">总体置信度</span>
              <span className={`text-sm font-bold ${getConfidenceColor(analysisData.confidence)}`}>
                {Math.round(analysisData.confidence * 100)}%
              </span>
            </div>
            <Progress value={analysisData.confidence * 100} className="h-2" />
          </div>
          
          {showDetails && (
            <div className="pt-2 space-y-4">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">详细分析</TabsTrigger>
                  <TabsTrigger value="anomalies">异常检测</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  {documentType === "idCard" && analysisData.ocrConfidence && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">OCR 识别准确率</span>
                        <span className={`text-sm font-medium ${getConfidenceColor(analysisData.ocrConfidence)}`}>
                          {Math.round(analysisData.ocrConfidence * 100)}%
                        </span>
                      </div>
                      <Progress value={analysisData.ocrConfidence * 100} className="h-1.5" />
                    </div>
                  )}
                  
                  {documentType === "face" && (
                    <>
                      {analysisData.matchScore && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">人脸匹配度</span>
                            <span className={`text-sm font-medium ${getConfidenceColor(analysisData.matchScore)}`}>
                              {Math.round(analysisData.matchScore * 100)}%
                            </span>
                          </div>
                          <Progress value={analysisData.matchScore * 100} className="h-1.5" />
                        </div>
                      )}
                      
                      {analysisData.livenessScore && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">活体检测分数</span>
                            <span className={`text-sm font-medium ${getConfidenceColor(analysisData.livenessScore)}`}>
                              {Math.round(analysisData.livenessScore * 100)}%
                            </span>
                          </div>
                          <Progress value={analysisData.livenessScore * 100} className="h-1.5" />
                        </div>
                      )}
                    </>
                  )}
                  
                  {documentType === "workBadge" && analysisData.ocrConfidence && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">工作证信息识别率</span>
                        <span className={`text-sm font-medium ${getConfidenceColor(analysisData.ocrConfidence)}`}>
                          {Math.round(analysisData.ocrConfidence * 100)}%
                        </span>
                      </div>
                      <Progress value={analysisData.ocrConfidence * 100} className="h-1.5" />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="anomalies" className="pt-4">
                  {analysisData.anomalies && analysisData.anomalies.length > 0 ? (
                    <div className="space-y-2">
                      {analysisData.anomalies.map((anomaly, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <AlertDescription>{anomaly}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm text-gray-500">未检测到异常</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {analysisData.verificationNotes && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-1">审核备注</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {analysisData.verificationNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          <Brain className="h-4 w-4 mr-1" />
          {showDetails ? "隐藏详细分析" : "查看详细分析"}
        </button>
      </CardFooter>
    </Card>
  );
}
