import React, { useState, useEffect, useDeferredValue, useCallback, useMemo } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import {
  getUserCollectionsWithCount,
  getPublicCollectionsWithCount,
  createCollection,
  deleteCollection,
  Collection,
  CollectionWithPersonaCount,
  updateCollection
} from "@/services/collections/collectionsService";
import Button from "@/components/ui-custom/Button";
import { Plus, Trash2, Edit, FolderOpen, Search, Grid, List, Globe, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCollections, setMyCollections] = useState<CollectionWithPersonaCount[]>([]);
  const [publicCollections, setPublicCollections] = useState<CollectionWithPersonaCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use deferred value for search to prevent excessive re-renders
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Filter collections based on search query and active tab
  const filteredCollections = useMemo(() => {
    const collections = activeTab === 'my-collections' ? myCollections : publicCollections;
    
    if (!deferredSearchQuery.trim()) {
      return collections;
    }
    return collections.filter(collection =>
      collection.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
      (collection.description && collection.description.toLowerCase().includes(deferredSearchQuery.toLowerCase()))
    );
  }, [myCollections, publicCollections, activeTab, deferredSearchQuery]);

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const [myData, publicData] = await Promise.all([
        getUserCollectionsWithCount(),
        getPublicCollectionsWithCount()
      ]);
      setMyCollections(myData);
      setPublicCollections(publicData);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleCreateCollection = async () => {
    if (!name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setIsCreating(true);
    try {
      const collection = await createCollection(name, description || null, isPublic);
      if (collection) {
        setCreateDialogOpen(false);
        setName("");
        setDescription("");
        setIsPublic(false);
        fetchCollections();
        toast.success(`Collection "${name}" created successfully`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection || !name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateCollection(selectedCollection.id, {
        name,
        description: description || null,
        is_public: isPublic
      });

      if (result) {
        setEditDialogOpen(false);
        fetchCollections();
        toast.success(`Collection "${name}" updated successfully`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    setIsDeleting(true);
    try {
      const result = await deleteCollection(selectedCollection.id);
      if (result) {
        toast.success(`Collection "${selectedCollection.name}" deleted`);
        setDeleteDialogOpen(false);
        fetchCollections();
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    } finally {
      setIsDeleting(false);
    }
  };

  const createBulkCollections = async () => {
    const collections = [
      {
        name: "Parents of College-Bound Teens",
        description: "Parents navigating the college application process and preparing their teenagers for higher education"
      },
      {
        name: "Parents Investing in Tutoring",
        description: "Parents who invest in additional educational support through tutoring services for their children"
      },
      {
        name: "Parents Paying for Private School",
        description: "Parents who choose and fund private school education for their children"
      },
      {
        name: "Christian Parents",
        description: "Parents who integrate Christian faith and values into their parenting approach"
      },
      {
        name: "Homeschooling Parents",
        description: "Parents who educate their children at home rather than traditional school settings"
      },
      {
        name: "Parents of Student Athletes",
        description: "Parents supporting their children in competitive sports and balancing athletics with academics"
      },
      {
        name: "Young Adults Starting Careers",
        description: "Recent graduates and young professionals entering the workforce and establishing their careers"
      },
      {
        name: "Divorced Adults",
        description: "Adults navigating life changes, co-parenting, and rebuilding after divorce"
      },
      {
        name: "Single Parents",
        description: "Parents raising children independently while managing work, finances, and personal responsibilities"
      },
      {
        name: "Healthcare Workers",
        description: "Medical professionals including doctors, nurses, and healthcare support staff"
      },
      {
        name: "Corporate Middle Managers",
        description: "Mid-level executives balancing leadership responsibilities with organizational pressures"
      },
      {
        name: "Entrepreneurs & Startup Founders",
        description: "Business founders and entrepreneurs building new ventures and navigating startup challenges"
      },
      {
        name: "Creative Professionals",
        description: "Artists, designers, writers, and other creative professionals pursuing their craft"
      },
      {
        name: "Blue-Collar & Skilled Trades",
        description: "Skilled workers in construction, manufacturing, mechanics, and other hands-on professions"
      },
      {
        name: "Sports Fans",
        description: "Enthusiastic followers of sports teams, leagues, and athletic competitions"
      },
      {
        name: "Outdoor Enthusiasts",
        description: "People passionate about hiking, camping, adventure sports, and outdoor recreation"
      },
      {
        name: "Collectors & Hobbyists",
        description: "Individuals dedicated to collecting items or pursuing specialized hobbies and interests"
      },
      {
        name: "Social Media Influencers",
        description: "Content creators and influencers building audiences and monetizing their online presence"
      },
      {
        name: "Mobile Gamers",
        description: "Players engaged with mobile gaming apps, competitive mobile games, and gaming communities"
      },
      {
        name: "Teenagers",
        description: "Adolescents navigating high school, social pressures, and preparing for adulthood"
      },
      {
        name: "High Debt Households",
        description: "Families and individuals managing significant debt burdens and working toward financial stability"
      },
      {
        name: "Underemployed Adults",
        description: "Adults working in jobs that don't fully utilize their skills or provide adequate compensation"
      },
      {
        name: "African-American Urban Consumers",
        description: "African-American consumers living in urban areas with distinct shopping and lifestyle preferences"
      },
      {
        name: "Rural Agricultural Workers",
        description: "Workers in farming, ranching, and agricultural industries in rural communities"
      },
      {
        name: "Faith-Driven Professionals",
        description: "Working professionals who integrate their religious faith into their career decisions and workplace behavior"
      },
      {
        name: "Progressive Democrats",
        description: "Democratic voters who support progressive policies and liberal social positions"
      },
      {
        name: "Moderate Democrats",
        description: "Democratic voters who hold centrist positions and support pragmatic policy approaches"
      },
      {
        name: "Conservative Republicans",
        description: "Republican voters who support traditional conservative values and limited government policies"
      },
      {
        name: "Moderate Republicans",
        description: "Republican voters who hold centrist positions and support bipartisan policy solutions"
      },
      {
        name: "Libertarians",
        description: "Voters who prioritize individual liberty, limited government, and free-market economics"
      },
      {
        name: "Anti-Establishment Voters",
        description: "Voters who distrust traditional political institutions and prefer outsider candidates"
      },
      {
        name: "Politically Disengaged Adults",
        description: "Adults who show little interest in politics or civic participation"
      },
      {
        name: "Latino Voters",
        description: "Hispanic and Latino voters with diverse backgrounds and political perspectives"
      },
      {
        name: "Black Voters",
        description: "African-American voters with shared experiences and diverse political viewpoints"
      },
      {
        name: "Asian-American Voters",
        description: "Asian-American voters representing diverse ethnic backgrounds and political perspectives"
      },
      {
        name: "White Working-Class Voters",
        description: "White voters in working-class jobs who focus on economic and employment issues"
      },
      {
        name: "Conservative Media Consumers",
        description: "Individuals who primarily consume conservative news sources and commentary"
      },
      {
        name: "Progressive Media Consumers",
        description: "Individuals who primarily consume progressive news sources and commentary"
      },
      {
        name: "Rural Conservative Voters",
        description: "Conservative voters living in rural areas with traditional values and limited government preferences"
      },
      {
        name: "Urban Progressive Voters",
        description: "Progressive voters living in urban areas who support liberal policies and social change"
      },
      {
        name: "Older Conservative Voters",
        description: "Senior citizens who hold conservative political views and traditional values"
      },
      {
        name: "Gun Rights Advocates",
        description: "Citizens who strongly support Second Amendment rights and gun ownership freedoms"
      },
      {
        name: "Gun Control Advocates",
        description: "Citizens who support stricter gun regulations and firearm safety measures"
      },
      {
        name: "Pro-Choice Voters",
        description: "Voters who support reproductive rights and abortion access"
      },
      {
        name: "Tax Reform Advocates",
        description: "Citizens who support changes to the tax system for fairness or economic growth"
      },
      {
        name: "Climate Activists",
        description: "Individuals actively engaged in environmental protection and climate change advocacy"
      },
      {
        name: "Uninsured / Underinsured Households",
        description: "Families lacking adequate health insurance coverage and facing healthcare cost challenges"
      },
      {
        name: "Border Security Advocates",
        description: "Citizens who prioritize strong immigration enforcement and border control measures"
      },
      {
        name: "Engaged Couples Planning Weddings",
        description: "Soon-to-be-married couples navigating wedding planning and preparation for marriage"
      },
      {
        name: "Newlyweds",
        description: "Recently married couples adjusting to married life and making joint decisions"
      },
      {
        name: "Jewish Families",
        description: "Families practicing Judaism and integrating Jewish traditions into their daily lives"
      },
      {
        name: "Jewish Young Professionals",
        description: "Young Jewish adults building careers while maintaining their religious and cultural identity"
      },
      {
        name: "Hindu Families",
        description: "Families practicing Hinduism and incorporating Hindu traditions into their family life"
      },
      {
        name: "Hindu Professionals",
        description: "Hindu individuals building careers while maintaining their religious and cultural practices"
      },
      {
        name: "Buddhist Practitioners",
        description: "Individuals who practice Buddhism and integrate Buddhist principles into their daily lives"
      },
      {
        name: "Evangelical Christian Families",
        description: "Christian families who emphasize personal relationship with Jesus and biblical authority"
      },
      {
        name: "Muslim Families",
        description: "Families practicing Islam and integrating Islamic values into their family structure"
      },
      {
        name: "Muslim Professionals",
        description: "Muslim individuals balancing career advancement with Islamic principles and practices"
      },
      {
        name: "Interfaith Households",
        description: "Families with members from different religious backgrounds navigating diverse beliefs"
      },
      {
        name: "Spiritual but Not Religious",
        description: "Individuals who maintain spiritual beliefs without formal religious affiliation"
      },
      {
        name: "Catholic Families",
        description: "Families practicing Catholicism and incorporating Catholic traditions into their lives"
      },
      {
        name: "Sikh Families",
        description: "Families practicing Sikhism and maintaining Sikh traditions and community connections"
      }
    ];

    try {
      for (const collection of collections) {
        await createCollection(collection.name, collection.description, true);
        console.log(`Created collection: ${collection.name}`);
      }
      fetchCollections();
      toast.success(`Successfully created ${collections.length} collections`);
    } catch (error) {
      console.error("Error creating bulk collections:", error);
      toast.error("Failed to create collections");
    }
  };

  const makeAllCollectionsPublic = async () => {
    try {
      let updatedCount = 0;
      for (const collection of myCollections) {
        if (!collection.is_public) {
          await updateCollection(collection.id, { is_public: true });
          updatedCount++;
          console.log(`Made collection public: ${collection.name}`);
        }
      }
      fetchCollections();
      toast.success(`Successfully made ${updatedCount} collections public`);
    } catch (error) {
      console.error("Error making collections public:", error);
      toast.error("Failed to update collections");
    }
  };

  const openEditDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to collection detail
    setSelectedCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setIsPublic(collection.is_public || false);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to collection detail
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  const viewCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };

  function renderCollectionsContent() {
    return (
      <>
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            {deferredSearchQuery !== searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg">
            <div className="rounded-full bg-muted/20 p-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            {searchQuery.trim() ? (
              <>
                <h3 className="font-medium text-lg mt-6">No collections found</h3>
                <p className="text-muted-foreground mt-2">
                  No collections match your search for "{searchQuery}"
                </p>
              </>
            ) : (
              <>
                <h3 className="font-medium text-lg mt-6">
                  {activeTab === 'my-collections' ? 'No collections yet' : 'No public collections available'}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {activeTab === 'my-collections' 
                    ? 'Create your first collection to organize your personas'
                    : 'No public collections have been shared by the community yet'
                  }
                </p>
                {activeTab === 'my-collections' && (
                  <Button 
                    className="mt-6"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Collection
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredCollections.map((collection) => {
              const isOwner = activeTab === 'my-collections';
              
              return (
                <div 
                  key={collection.id}
                  className={`relative border rounded-lg p-6 hover:shadow-md transition-shadow group cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  }`}
                  onClick={() => viewCollection(collection.id)}
                >
                  {viewMode === 'grid' ? (
                    <div className="flex flex-col h-full min-h-[200px]">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h2 className="text-xl font-semibold line-clamp-2 leading-tight h-14 flex items-start">{collection.name}</h2>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {collection.is_public ? (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {collection.description || "No description"}
                        </p>
                      </div>
                      <div className="flex justify-between items-end pt-4 mt-auto">
                        <p className="text-sm text-muted-foreground">
                          {collection.persona_count} personas
                        </p>
                        {isOwner && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => openEditDialog(collection, e)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => openDeleteDialog(collection, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="text-xl font-semibold">{collection.name}</h2>
                          {collection.is_public ? (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {collection.description || "No description"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {collection.persona_count} personas
                        </p>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => openEditDialog(collection, e)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => openDeleteDialog(collection, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <Header />
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6 flex flex-col mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Collections</h1>
                <p className="text-muted-foreground mt-2">
                  Organize your personas and discover public collections from the community.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Collection
                </Button>
                <Button onClick={createBulkCollections} variant="outline">
                  Create All Collections (62)
                </Button>
                <Button onClick={makeAllCollectionsPublic} variant="outline">
                  Make All Public
                </Button>
              </div>
            </div>

            {/* Tabs for My Collections vs Public Collections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="my-collections" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  My Collections
                  <Badge variant="secondary" className="ml-1">
                    {myCollections.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="public-collections" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public Collections
                  <Badge variant="secondary" className="ml-1">
                    {publicCollections.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-collections" className="mt-0">
                {renderCollectionsContent()}
              </TabsContent>
              
              <TabsContent value="public-collections" className="mt-0">
                {renderCollectionsContent()}
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Collection"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your collection..."
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <label htmlFor="public" className="text-sm font-medium cursor-pointer">
                  Collection Visibility
                </label>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? "Anyone can view this collection" : "Only you can view this collection"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Private</span>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <label htmlFor="edit-public" className="text-sm font-medium cursor-pointer">
                  Collection Visibility
                </label>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? "Anyone can view this collection" : "Only you can view this collection"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Private</span>
                <Switch
                  id="edit-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCollection} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCollection?.name}"? This action cannot
              be undone and all persona references will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCollection} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Collections;