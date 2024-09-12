import React, { useEffect, useState } from "react";

import { AuthContextHolder } from "../api/bsf/AuthContext";
import { MaterialsDownloadRequest } from "../api/bsf/requests/MaterialsDownloadRequest";
import { MaterialsRequest } from "../api/bsf/requests/MaterialsRequest";

interface LectureAndNotesProps {
    lessonId: number;
}

enum MaterialType {
    LECTURE = 1,
    AUDIO_NOTES = 2,
    HTML_NOTES = 3,
}

interface FilteredMaterial {
    name: string;
    materialId: number;
    url: string;
    materialType: MaterialType;
}

const LectureAndNotesComponent: React.FC<LectureAndNotesProps> = ({
    lessonId,
}) => {
    // const settings = useContext(SettingsContext);

    const [materials, setMaterials] = useState<FilteredMaterial[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getFileUrl = async (material: Material): Promise<string> => {
        if (material.fileLocationUrlWithSas) {
            return material.fileLocationUrlWithSas;
        }
        const downloadRequest = new MaterialsDownloadRequest(
            AuthContextHolder.getAuthContext(),
            material.materialId
        );
        return (await downloadRequest.makeRequest()).url;
    };

    useEffect(() => {
        if (lessonId) {
            const fetchMaterials = async () => {
                const materialsRequest = new MaterialsRequest(
                    AuthContextHolder.getAuthContext(),
                    lessonId
                );
                try {
                    const materialsResponse =
                        await materialsRequest.makeRequest();

                    // Filter out the materials that aren't lectures or HTML notes
                    const filteredMaterials: FilteredMaterial[] = [];
                    for (const material of materialsResponse) {
                        const name = material.translations[0].name;
                        const materialId = material.materialId;
                        if (
                            material.materialCategoryId === 2 &&
                            material.materialTypeId === 1 &&
                            material.materialFileTypeId === 1 &&
                            material.fileLocationUrl
                                .toLocaleLowerCase()
                                .endsWith(".html")
                        ) {
                            const url = await getFileUrl(material);
                            const materialType = MaterialType.HTML_NOTES;
                            filteredMaterials.push({
                                name,
                                materialId,
                                url,
                                materialType,
                            });
                        } else if (
                            material.materialCategoryId === 2 &&
                            material.materialTypeId === 1 &&
                            material.materialFileTypeId === 3
                        ) {
                            const url = await getFileUrl(material);
                            const materialType = MaterialType.AUDIO_NOTES;
                            filteredMaterials.push({
                                name,
                                materialId,
                                url,
                                materialType,
                            });
                        }
                    }

                    filteredMaterials.sort((a, b) => {
                        return a.materialType - b.materialType;
                    });

                    setMaterials(filteredMaterials);
                } catch (error) {
                    console.error("Failed to fetch materials", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchMaterials();
        }
    }, [lessonId]);

    if (loading) {
        return <div>Loading materials...</div>;
    }

    if (!materials.length) {
        return <div>No materials found.</div>;
    }

    return (
        <div className="lecture-and-notes-area">
            <h3>Materials</h3>
            {materials.map((material) => {
                // Only use proxy URL for HTML_NOTES
                const htmlProxyUrl =
                    material.materialType === MaterialType.HTML_NOTES
                        ? `https://ajxqcsfpbtppe7rhsqwkmbrdx40phvnl.lambda-url.us-east-1.on.aws/?contentType=${encodeURIComponent(
                              "text/html"
                          )}&fileUrl=${encodeURIComponent(material.url)}`
                        : material.url;

                return (
                    <div key={material.materialId}>
                        <a href={material.url} target="_blank" rel="noreferrer">
                            {material.name}
                        </a>
                        {material.materialType === MaterialType.HTML_NOTES && (
                            <iframe
                                src={htmlProxyUrl}
                                title={material.name}
                                width="100%"
                                height="500px"
                            ></iframe>
                        )}
                        {material.materialType === MaterialType.AUDIO_NOTES && (
                            <div className="notes-audio-area">
                                <audio controls>
                                    <source
                                        src={material.url}
                                        type="audio/mpeg"
                                    />
                                </audio>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default LectureAndNotesComponent;
