
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserInfo } from '@/types';

interface UserInfoCardProps {
  userInfo: UserInfo;
  onUserInfoChange: (info: UserInfo) => void;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ userInfo, onUserInfoChange }) => {
  const updateUserInfo = (field: keyof UserInfo, value: any) => {
    onUserInfoChange({ ...userInfo, [field]: value });
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-800">
          Personalize Your Insights <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={userInfo.age || ''}
              onChange={(e) => updateUserInfo('age', e.target.value ? parseInt(e.target.value) : undefined)}
              className="border-gray-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sex" className="text-sm font-medium text-gray-700">Sex</Label>
            <Select value={userInfo.sex || ''} onValueChange={(value) => updateUserInfo('sex', value as UserInfo['sex'])}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goals" className="text-sm font-medium text-gray-700">Primary Goal</Label>
            <Select value={userInfo.goals || ''} onValueChange={(value) => updateUserInfo('goals', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boost-energy">Boost Energy</SelectItem>
                <SelectItem value="lose-weight">Lose Weight</SelectItem>
                <SelectItem value="build-muscle">Build Muscle</SelectItem>
                <SelectItem value="improve-sleep">Improve Sleep</SelectItem>
                <SelectItem value="reduce-stress">Reduce Stress</SelectItem>
                <SelectItem value="general-health">General Health</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="activity" className="text-sm font-medium text-gray-700">Activity Level</Label>
            <Select value={userInfo.activity || ''} onValueChange={(value) => updateUserInfo('activity', value as UserInfo['activity'])}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sedentary">Sedentary (Desk job, little exercise)</SelectItem>
                <SelectItem value="Active">Active (Regular exercise 3-5x/week)</SelectItem>
                <SelectItem value="Athlete">Athlete (Daily intense training)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
